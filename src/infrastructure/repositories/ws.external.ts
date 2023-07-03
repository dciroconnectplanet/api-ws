import { cwd } from 'node:process';
import { join } from 'path';

import { image as imageQr } from 'qr-image';
import { v4 as uuid } from 'uuid';
import { Client, LocalAuth, type Contact } from 'whatsapp-web.js';

import LeadExternal from '../../domain/lead-external.repository';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth({ clientId: uuid() }),
      qrMaxRetries: 10,
      takeoverOnConflict: true,
      takeoverTimeoutMs: 0,
      puppeteer: {
        headless: true,
        args: [
          '--disable-setuid-sandbox',
          '--unhandled-rejections=strict',
          '--no-sandbox',
        ],
      },
    });

    console.log('Iniciando....');

    this.on('ready', async () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');

      this.getAllNumbersPhone(this);
    });

    this.on('auth_failure', async () => {
      this.status = false;
      console.log('LOGIN_FAIL');

      this.initializeClient(this);
    });

    this.on('qr', (qr) => {
      console.log('Escanea el codigo QR que esta en la carepta tmp');
      this.generateImage(qr);
    });

    this.on('disconnected', (reason) => {
      console.log('Client disconected: ', reason);
      // Destroy and reinitialize the client when disconnected
      this.destroy();
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
    let path = '';

    if (process.env.NODE_ENV === 'production') {
      path = join(cwd(), 'tmp', 'qr.svg');
    } else {
      path = join(cwd(), 'tmp', 'qr.svg');
    }
    console.log({ path });
    let qr_svg = imageQr(base64, { type: 'svg', margin: 4 });
    qr_svg.pipe(require('fs').createWriteStream(path));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡`);
  };

  private initializeClient(client: WsTransporter) {
    client.initialize().then().catch(console.error);
  }

  private async getAllNumbersPhone(client: WsTransporter) {
    try {
      const contacts: Contact[] = await client.getContacts();
      const numbers = contacts
        .map(({ number, name }) => ({ number, name }))
        .filter(({ name, number }) => name != undefined && number != undefined);

      console.log({ numbers });
    } catch (error) {
      console.error(error);
    }
  }
}

export default WsTransporter;
