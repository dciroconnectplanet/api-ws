import { v4 as uuid } from 'uuid';
import { Client, LocalAuth, type Contact } from 'whatsapp-web.js';

import LeadExternal from '../../domain/lead-external.repository';
import { updateQrImage } from '../../sockets';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth({ clientId: uuid() }),
      takeoverOnConflict: true,
      qrMaxRetries: 10,
      puppeteer: {
        headless: true,
        args: [
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--deterministic-fetch',
          '--disable-features=IsolateOrigins',
          '--disable-site-isolation-trials',
        ],
      },
    });

    console.log('Iniciando....');

    this.on('ready', async () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');

      // no dejamos
      updateQrImage({ loginSuccess: true, qrImage: '' });
      this.getAllNumbersPhone(this);
    });

    this.on('auth_failure', async () => {
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

    this.initialize().then().catch(console.log);
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
