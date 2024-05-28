import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { WppConnectService } from './wppconnect.service';
import { Response } from 'express';

@Controller('wppconnect')
export class WppConnectController {
  constructor(private readonly wppConnectService: WppConnectService) {}

  @Get('connect')
  async connect(@Res() res: Response): Promise<void> {
    await this.wppConnectService.connect();
  }
  @Get('qr')
  getQrCode(@Res() res: Response) {
    const qrCode = this.wppConnectService.getQrCode();
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp QR Code</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #103928;
            color: #FFFFFF;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
          .container {
            text-align: center;
            background-color: #1C1E21;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          }
          .container img {
            max-width: 80%;
            border: 5px solid #43CD66;
            border-radius: 10px;
          }
          .instructions {
            margin-top: 20px;
          }
          .instructions p {
            margin: 10px 0;
          }
          .icon {
            width: 50px;
            height: 50px;
            margin-bottom: 20px;
          }
          .qr-code {
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Icon" class="icon">
          <h1>Scan the QR Code</h1>
          <div class="qr-code">
            <img src="${qrCode}" alt="QR Code">
          </div>
          <div class="instructions">
            <p>1. Open WhatsApp on your phone.</p>
            <p>2. Tap Menu or Settings and select WhatsApp Web.</p>
            <p>3. Point your phone at this screen to capture the code.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  @Get('status')
  checkConnectionStatus() {
    const isConnected = !!this.wppConnectService.getQrCode();
    return { success: isConnected };
  }

  @Get('success')
  connectionSuccess(@Res() res: Response) {
    res.json({ success: true, message: 'Client connected' });
  }

  @Post('sendMessage')
  async sendMessage(@Body() body: { phone: string; text: string; key?: number }) {
    const { phone, text, key } = body;
    if (key === undefined) {
      return {
        success: false,
        message: 'Key not provided',
      };
    }
    const date = new Date();
    const serverKey = date.getDate() * (date.getMonth() + 1) * date.getFullYear();
    
    if (serverKey !== key) {
      return {
        success: false,
        message: 'Invalid key',
      };
    } else {
      return this.wppConnectService.sendMessage(phone, text);
    }
  }

  @Get('sendMessage')
  async sendMessageGET() {
    const retorno = {
      message: 'Please use POST method to send a message',
    };
    return retorno;
  }
}
