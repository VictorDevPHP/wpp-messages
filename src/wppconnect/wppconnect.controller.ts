import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { WppConnectService } from "./wppconnect.service";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("wppconnect")
export class WppConnectController {
  constructor(
    private readonly wppConnectService: WppConnectService,
    private readonly configService: ConfigService,
  ) {}

  @Get("connect")
  /**
   * Connects to the WhatsApp server.
   * @param res - The response object.
   * @returns A promise that resolves when the connection is established.
   */
  async connect(@Res() res: Response): Promise<void> {
    await this.wppConnectService.connect();
  }
  @Get("qr")
  /**
   * Retrieves the QR code for WhatsApp Web.
   * @param res - The response object to send the HTML page with the QR code.
   */
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

  @Get("status")
  /**
   * Checks the connection status.
   * @returns An object indicating the success of the connection.
   */
  /**
   * Checks the connection status of the WhatsApp Connect service.
   * @returns An object indicating the success of the connection.
   */
  checkConnectionStatus() {
    const isConnected = !!this.wppConnectService.getQrCode();
    return { success: isConnected };
  }

  @Get("success")
  /**
   * Handles the successful connection event.
   * 
   * @param res - The response object.
   */
  connectionSuccess(@Res() res: Response) {
    res.json({ success: true, message: "Client connected" });
  }

  @Post("sendMessage")
  /**
   * Sends a message using the WhatsApp Connect service.
   * @param body - The request body containing the phone number, message text, and API key.
   * @returns A promise that resolves to the result of the message sending operation.
   */
  async sendMessage(@Body() body: { phone: string; text: string; key: string },) {
    const { phone, text, key} = body;
    const keyEnv = this.configService.get("API_KEY");
    if (key !== keyEnv) {
      return { message: "Invalid API Key", success: false, code: 401 + ' Unauthorized'};
    }else{
      return this.wppConnectService.sendMessage(phone, text);
    }
  }

  @Get("sendMessage")
  /**
   * Sends a message using the GET method.
   * 
   * @returns An object containing the message indicating that the POST method should be used to send a message.
   */
  async sendMessageGET() {
    const retorno = {
      message: "Please use POST method to send a message",
    };
    return retorno;
  }
}
