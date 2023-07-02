import { Client, LocalAuth } from 'whatsapp-web.js';

import LeadExternal from '../../domain/lead-external.repository';
import { updateQrImage } from '../../sockets';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--log-level=3', // fatal only
          '--start-maximized',
          '--no-default-browser-check',
          '--disable-infobars',
          '--disable-web-security',
          '--disable-site-isolation-trials',
          '--no-experiments',
          '--ignore-gpu-blacklist',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-default-apps',
          '--enable-features=NetworkService',
          '--disable-setuid-sandbox',
          '--no-sandbox',
        ],
      },
    });

    console.log('Iniciando....');
    this.initialize().then().catch(console.log);

    this.on('ready', () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');

      // no dejamos
      updateQrImage({ loginSuccess: true, qrImage: '' });

      this.getAllNumbersPhone(this);
    });

    this.on('auth_failure', () => {
      this.status = false;
      console.log('LOGIN_FAIL');

      // emitir al front que se genero un nuevo QR
      this.generateQrCode(this);
    });

    this.on('qr', (qr) => {
      this.generateImage(qr);
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Promise Rejection:', error);
    });
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
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡`);

    // emitir al front que se genero un nuevo QR
    updateQrImage({ loginSuccess: false, qrImage: base64 });
  };

  private generateQrCode(client: WsTransporter) {
    client.on('qr', (qr) => {
      this.generateImage(qr);
    });
  }

  private async getAllNumbersPhone(client: WsTransporter) {
    try {
      const contacts = await client.getContacts();

      console.log({ contacts });
    } catch (error) {
      console.error(error);
    }
  }
}

export default WsTransporter;
