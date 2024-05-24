import { Injectable } from '@nestjs/common';
import { create, Whatsapp, CreateOptions } from '@wppconnect-team/wppconnect';

@Injectable()
export class WppConnectService {
  private client: Whatsapp;

  async connect(): Promise<string> {
    const createOption: CreateOptions = {
      session: 'session-name',
      headless: true,
      puppeteerOptions: {
        args: ['--no-sandbox'],
      },
      logQR: true,
    };

    this.client = await create(createOption);
    return 'Client connected';
  }

  async sendMessage(phone: string, text: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('Client is not connected');
      }
      await this.client.sendText(phone, text);
      return { success: true, message: 'Message sent successfully: phone:' + phone + ' message: '+  text};
    } catch (error) {
      return { success: false, error: error.message+' phone:' + phone + ' message: '+  text};
    }
  }
}
