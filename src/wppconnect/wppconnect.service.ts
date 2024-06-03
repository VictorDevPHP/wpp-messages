import { Injectable} from "@nestjs/common";
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { create, Whatsapp } from "@wppconnect-team/wppconnect";
import * as fs from 'fs';
import { log } from "console";
import { QRCode } from '../models/qrCode.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WppConnectService {
  constructor(
    @InjectRepository(QRCode)
    private qrCodeRepository: Repository<QRCode>,
  ) {}
  private client: Whatsapp;
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
    return connected;
  }

  /**
   * Retrieves the QR code for the WhatsApp connection.
   * @returns The QR code as a string.
   */
  getQrCode(): string {
    console.log("QR Gerado");
    return this.qrCode;
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
  
  listSessions(): string[] {
    const tokenDir = path.join(__dirname, 'tokens');
    return fs.readdirSync(tokenDir);
  }
}
