import { cwd } from 'node:process';
import { join } from 'path';

import { image as imageQr } from 'qr-image';
import { v4 as uuid } from 'uuid';
import { Chat, Client, LocalAuth, type Contact } from 'whatsapp-web.js';

import LeadExternal from '../../domain/lead-external.repository';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth({ clientId: uuid() }),
      qrMaxRetries: 2,
      takeoverOnConflict: true,
      takeoverTimeoutMs: 0,
      puppeteer: {
        headless: false,
        args: [
          '--no-sandbox',
        ],
      },
    });

    console.log('Iniciando....');

    this.on('ready', async () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');
      this.info;

      this.closeWSWindow(this);
      this.getAllChats(this);
    });

    this.on('auth_failure', async () => {
      this.status = false;
      console.log('LOGIN_FAIL');

      this.initializeClient(this);
    });

    this.on('qr', (qr) => {
      console.log('Escanea el codigo QR que esta en la carpeta tmp');
      this.generateImage(qr);
    });

    this.on('disconnected', async (reason) => {
      console.log('Client disconected: ', reason);
      // Destroy and reinitialize the client when disconnected
      await this.destroy();
      this.initializeClient(this);
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Promise Rejection:', error);
    });

    this.initializeClient(this);
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: { message: string; phone: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: 'WAIT_LOGIN' });
      const { message, phone } = lead;
      const response = await this.sendMessage(`${phone}@c.us`, message);
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = join(cwd(), 'tmp', 'qr.svg');
    let qr_svg = imageQr(base64, { type: 'svg', margin: 4 });
    qr_svg.pipe(require('fs').createWriteStream(path));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡`);
  };

  private initializeClient(client: WsTransporter) {
    client.initialize().catch(console.error);
  }

  private async getAllChats(client: WsTransporter) {
    try {
      const chats: Chat[] = await client.getChats();

      for (const chat of chats) {
        const contact = await chat.getContact();
        console.log(contact);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private closeWSWindow(client: WsTransporter) {
    if (client.pupPage) {
      client.pupPage.click('#pane-side');
    }
  }
}

export default WsTransporter;
