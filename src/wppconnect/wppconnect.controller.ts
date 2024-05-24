import { Controller, Get, Post, Body } from '@nestjs/common';
import { WppConnectService } from './wppconnect.service';

@Controller('wppconnect')
export class WppConnectController {
  constructor(private readonly wppConnectService: WppConnectService) {}

  @Get('connect')
  async connect(): Promise<string> {
    return this.wppConnectService.connect();
  }

  @Post('sendMessage')
  async sendMessage(@Body() body: { phone: string; text: string }): Promise<any> {
    const { phone, text } = body;
    return this.wppConnectService.sendMessage(phone, text);
  }

  @Get('sendMessage')
  async sendMessageGET(): Promise<string> {
    return 'Please use POST method to send a message';
  }
}
