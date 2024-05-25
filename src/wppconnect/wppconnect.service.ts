import { Injectable } from '@nestjs/common';
import { create, Whatsapp, CreateOptions } from '@wppconnect-team/wppconnect';
import axios from 'axios';

@Injectable()
export class WppConnectService {
  private client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;

  async connect(): Promise<boolean> {
      this.client = await create({
        session: 'session-name',
        headless: true,
        puppeteerOptions: {
          args: ['--no-sandbox'],
        },
        logQR: false,
        catchQR: (base64Qr, asciiQR) => {
          this.qrCode = base64Qr;
          this.qrCodeGenerated = true;
          this.getQrCode();
        },
      });
      return true;
  }

  getQrCode(): string {
    return this.qrCode;
  }
  async sendMessage(phone: string, text: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('Client is not connected');
      }
      await this.client.sendText(phone, text);
      return { success: true, message: `Message sent successfully: phone: ${phone} message: ${text}` };
    } catch (error) {
      return { success: false, error: `${error.message} phone: ${phone} message: ${text}` };
    }
  }
}
