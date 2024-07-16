import { Injectable, Logger } from "@nestjs/common";
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { create, Whatsapp, Message } from "@wppconnect-team/wppconnect";
import * as fs from 'fs';
import { log } from "console";
import { QRCode } from '../models/qrCode.entity';
import { WppSessions } from "src/models/wpp-sessions.entity";
import { Repository } from 'typeorm';
import { existsSync, mkdirSync } from 'fs';
import { GeminiService } from "src/api/gemini/gemini.service";

@Injectable()
export class WppConnectService {
  
  constructor(
    @InjectRepository(QRCode)
    private qrCodeRepository: Repository<QRCode>,

    @InjectRepository(WppSessions)
    private wppSessionsRepository: Repository<WppSessions>,

    private geminiService: GeminiService
  ) {
    this.tokensDir = process.env.TOKENS_DIR ?? path.join('/tmp', 'tokens');
  }

  public client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;
  private clientSessions = new Map();
  private chatSessions: Map<string, any> = new Map();
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
          userDataDir: this.tokensDir + '/' + sessionName,
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
            Logger.error('Erro ao salvar o QR Code no banco de dados: ', error);
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
      Logger.error('Não foi possivel se conectar');
    } else {
      this.startListeningForMessages();
      await this.updateSessionStatus(sessionName, true);
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
                Logger.verbose('Mensagem ignorada pela IA', sessionName);
                return;
            }

            const now = new Date();
            const timestamp = now.toLocaleString();
            Logger.debug(`Mensagem recebida de session ${sessionName}:`);
            if (!this.chatSessions.has(sessionName)) {
              this.chatSessions.set(sessionName, await this.geminiService.startChat(sessionName));
            }
            const textAi = await this.getAiResponse(sessionName, message.content);
            if(textAi != undefined){
              const response = await this.sendMessage(message.from, textAi);
            }
        });
    });
  }

  async getAiResponse(sessionName: string, messageContent: string): Promise<string> {
      const chat = this.chatSessions.get(sessionName);
      return await chat.sendMessageToAI(messageContent, sessionName);
  }

  async startAllSessions(): Promise<void> {
    const sessions = this.listSessions();
    if (!sessions || sessions.length === 0) {
      Logger.debug('No sessions found');
      return;
    }
    for (const session of sessions) {
      try {
        const connected = await this.connect(session);
        if (connected) {
          Logger.verbose(`Session ${session} started successfully.`);
        } else {
          Logger.error(`Failed to start session ${session}`);
        }
      } catch (error) {
        Logger.error(`Failed to start session ${session}:`, error);
      }
    }
    return Promise.resolve();
  }

  getQrCode(): string {
    Logger.log("QR Gerado");
    return this.qrCode;
  }

  listSessions(): string[] {
    if (!existsSync(this.tokensDir)) {
      mkdirSync(this.tokensDir);
    }
    return fs.readdirSync(this.tokensDir);
  }

  async updateSessionStatus(sessionName: string, connected: boolean) {
    let session = await this.wppSessionsRepository.findOne({ where: { session_name: sessionName } });

    if (session) {
      session.connected = connected;
      await this.wppSessionsRepository.save(session);
    } else {
      session = this.wppSessionsRepository.create({
        session_name: sessionName,
        connected: connected,
        customer_id: null,
        qrcode: this.qrCode
      });
      await this.wppSessionsRepository.save(session);
    }
  }
}
