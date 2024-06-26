import { Injectable } from "@nestjs/common";
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { create, Whatsapp, Message } from "@wppconnect-team/wppconnect";
import * as fs from 'fs';
import { log } from "console";
import { QRCode } from '../models/qrCode.entity';
import { Repository } from 'typeorm';
import { existsSync, mkdirSync } from 'fs';
import { GeminiService } from "src/api/gemini/gemini.service";

@Injectable()
export class WppConnectService {
  constructor(
    @InjectRepository(QRCode)
    private qrCodeRepository: Repository<QRCode>,
    private geminiService: GeminiService
  ) {
    this.userDataDir = process.env.USER_DATA_DIR || path.join('/tmp', 'wppconnect');
    this.tokensDir = process.env.TOKENS_DIR || path.join('/tmp', 'tokens');
  }

  public client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;
  private sessions: Map<string, Whatsapp> = new Map();
  private clientSessions = new Map();
  private chatSessions: Map<string, any> = new Map();
  private userDataDir: string;
  private tokensDir: string;

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
            userDataDir: this.userDataDir,
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
        this.clientSessions.set(sessionName, this.client);
        connected = true;
      } catch (error) {
        connected = false;
      }
      if (connected == false) {
        const sessionDirPath = path.join(this.tokensDir, sessionName);
        console.log(sessionDirPath);
        if (fs.existsSync(sessionDirPath)) {
          console.log(`Directory ${sessionDirPath} exists`);
          fs.rmdirSync(sessionDirPath, { recursive: true });
          console.log(`Directory ${sessionDirPath} has been removed`);
        }
      } else {
        this.startListeningForMessages();
      }
    return connected;
  }

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

  async startListeningForMessages(): Promise<void> {
    this.clientSessions.forEach((client, sessionName) => {
      client.onMessage(async (message: Message) => {
        if (message.chatId === 'status@broadcast' || ['image/jpeg', 'audio/ogg; codecs=opus'].includes(message.mimetype) || message.isGroupMsg === true) {
          console.log('Mensagem ignorada pela IA');
          return;
        }
        this.logReceivedMessage(sessionName, message);

        if (!this.chatSessions.has(sessionName)) {
          this.chatSessions.set(sessionName, await this.geminiService.startChat([]));
        }

        const textAi = await this.getAiResponse(sessionName, message.content);
        const response = await this.sendMessage(message.from, textAi); 
        console.log('mensagem: ' + message.content + ' -----> Res: ' + textAi);
      });
    });
  }

  logReceivedMessage(sessionName: string, message: Message): void {
    const now = new Date();
    const timestamp = now.toLocaleString();
    console.log(`[${timestamp}] Mensagem recebida de session ${sessionName}:`, message.from + ': ' + message.content);
  }

  async getAiResponse(sessionName: string, messageContent: string): Promise<string> {
    const chat = this.chatSessions.get(sessionName);
    return await chat.sendMessageToAI(messageContent, sessionName);
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

  getQrCode(): string {
    console.log("QR Gerado");
    return this.qrCode;
  }

  listSessions(): string[] {
    if (!existsSync(this.tokensDir)) {
      mkdirSync(this.tokensDir);
    }
    return fs.readdirSync(this.tokensDir);
  }
}
