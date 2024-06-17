import { Injectable} from "@nestjs/common";
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { create, Whatsapp, Message } from "@wppconnect-team/wppconnect";
import * as fs from 'fs';
import { log } from "console";
import { QRCode } from '../models/qrCode.entity';
import { Repository } from 'typeorm';
import { existsSync, mkdirSync } from 'fs';


@Injectable()
export class WppConnectService {
  constructor(
    @InjectRepository(QRCode)
    private qrCodeRepository: Repository<QRCode>,
  ) {}
  public client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;
  private sessions: Map<string, Whatsapp> = new Map();

  /**
   * Connects to the WhatsApp service.
   * @returns A Promise that resolves to a boolean indicating whether the connection was successful.
   */
  async connect(sessionName: string): Promise<boolean> {
    const chromePath = process.env.CHROME_PATH;
    let connected = false;
      try {
        this.client = await create({
          session: sessionName,
          headless: process.env.HEADLESS === 'true' ? true : process.env.HEADLESS === 'false' ? false : 'shell',
          puppeteerOptions: {
            executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
            args: ["--no-sandbox"],
          },
          logQR: true,
          autoClose: 0,
          catchQR: async (base64Qr, asciiQR) => {
            this.qrCode = base64Qr;
            this.qrCodeGenerated = true;
            this.qrCodeRepository.insert({
              qrCode: base64Qr,
              session: sessionName
            }).then(() => {
              log('QR Code salvo no banco de dados com sucesso');
            }).catch(error => {
              console.error('Erro ao salvar o QR Code no banco de dados: ', error);
            });
            this.getQrCode();
          },
        });
        connected = true;
      } catch (error) {
        connected = false;
      }
      if(connected == false){
        const sessionDirPath = path.join(__dirname, '..', '..', 'tokens', sessionName);
        console.log(sessionDirPath);
        if (fs.existsSync(sessionDirPath)) {
          console.log(`Directory ${sessionDirPath} exists`);
          fs.rmdirSync(sessionDirPath, { recursive: true });
          console.log(`Directory ${sessionDirPath} has been removed`);
        }
      }else{
        this.startListeningForMessages();
      }
    return connected;
  }

  /**
   * Sends a message to a phone number using the connected client.
   * @param phone The phone number to send the message to.
   * @param text The text message to send.
   * @returns A promise that resolves to an object with the success status and message details.
   */
  async sendMessage(phone: string, text: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error("Client is not connected");
      }
      await this.client.sendText(phone, text);
      return {
        success: true,
        message: `Message sent successfully: phone: ${phone} message: ${text}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `${error.message} phone: ${phone} message: ${text}`,
      };
    }
  }

    /**
   * Starts listening for incoming messages.
   */
    async startListeningForMessages(): Promise<void> {
      if (!this.client) {
        throw new Error("Client is not connected");
      }
      this.client.onMessage((message: Message) => {
        console.log("Received a new message:", message);
        // Aqui você pode adicionar o código para processar a mensagem recebida.
      });
    }


    async startAllSessions(): Promise<void> {
      const sessions = this.listSessions();
      if (!sessions || sessions.length === 0) {
        console.error('No sessions found');
        return;
      }
      for (const session of sessions) {
        try {
          const connected = await this.connect(session);
          if (connected) {
            console.log(`Session ${session} started successfully.`);
          } else {
            console.error(`Failed to start session ${session}`);
          }
        } catch (error) {
          console.error(`Failed to start session ${session}:`, error);
        }
      }
      return Promise.resolve();
    }

  /**
   * Retrieves the QR code for the WhatsApp connection.
   * @returns The QR code as a string.
   */
  getQrCode(): string {
    console.log("QR Gerado");
    return this.qrCode;
  }
  
  listSessions(): string[] {
    const sessionDirPath = path.join(__dirname, '..', '..', 'tokens');
    if (!existsSync(sessionDirPath)) {
      mkdirSync(sessionDirPath);
    }
    return fs.readdirSync(sessionDirPath);
  }
}
