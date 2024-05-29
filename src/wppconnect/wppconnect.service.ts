import { Injectable } from "@nestjs/common";
import { create, CreateOptions, Whatsapp } from "@wppconnect-team/wppconnect";
import axios from "axios";

@Injectable()
export class WppConnectService {
  private client: Whatsapp;
  private qrCode: string;
  private qrCodeGenerated = false;

  /**
   * Connects to the WhatsApp service.
   * @returns A promise that resolves to a boolean indicating whether the connection was successful.
   */
  async connect(): Promise<boolean> {
    this.client = await create({
      session: "session-name",
      headless: true,
      puppeteerOptions: {
        args: ["--no-sandbox"],
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

  /**
   * Retrieves the QR code for the WhatsApp connection.
   * @returns The QR code as a string.
   */
  getQrCode(): string {
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
