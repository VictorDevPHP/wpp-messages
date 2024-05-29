import { Injectable} from "@nestjs/common";
import axios from 'axios';
import { create, CreateOptions, Whatsapp } from "@wppconnect-team/wppconnect";
import * as fs from 'fs';

@Injectable()
export class WppConnectService {
  private client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;

  /**
   * Connects to the WhatsApp service.
   * @returns A Promise that resolves to a boolean indicating whether the connection was successful.
   */
  async connect(): Promise<boolean> {
    const chromePath = process.env.CHROME_PATH;
    let connected = false;
    let attempts = 1;
    const maxAttempts = 3;
    do {
      try {
        this.client = await create({
          session: "session-name",
          headless: process.env.HEADLESS === 'true' ? true : process.env.HEADLESS === 'false' ? false : 'shell',
          puppeteerOptions: {
            executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
            args: ["--no-sandbox"],
          },
          logQR: true,
          catchQR: async (base64Qr, asciiQR) => {
            this.qrCode = base64Qr;
            this.qrCodeGenerated = true;
            this.getQrCode();
            setTimeout(() => {
              this.qrCodeGenerated = false;
              // Notificar a aplicação Laravel que o QRCode expirou
              axios.post('http://exemple-dash.com/endpoint', {
                message: 'QRCode expirou',
                session: "session-name"
              })
              .then(response => {
                console.log('Notificação enviada com sucesso');
              })
              .catch(error => {
                console.error('Erro ao enviar notificação:', error);
              });
            }, 60000);
          },
        });
        connected = true;
      } catch (error) {
        console.error('Erro ao conectar:', error);
        attempts++;
        console.log('Tentativa ' + attempts+'/'+maxAttempts);
        if (attempts >= maxAttempts) {
          console.error('Número máximo de tentativas atingido');
          break;
        }
      }
    } while (!connected && attempts <= maxAttempts);
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
}
