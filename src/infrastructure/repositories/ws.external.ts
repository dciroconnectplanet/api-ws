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
        args: ['--no-sandbox'],
      },
    });

    console.log('Iniciando....');

    this.initialize().catch((_) => _);

    this.on('ready', () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');

      // no dejamos
      updateQrImage({ loginSuccess: true, qrImage: '' });
      this.getUnreadMsg(this);
    });

    this.on('auth_failure', () => {
      this.status = false;
      console.log('LOGIN_FAIL');

      // emitir al front que se genero un nuevo QR
      this.generateQrCode(this);
    });

    this.on('qr', (qr) => {
      console.log('Escanea el código QR que está en la carpeta tmp.');
      this.generateImage(qr);
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
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);

    // emitir al front que se genero un nuevo QR
    updateQrImage({ loginSuccess: false, qrImage: base64 });
  };

  async getUnreadMsg(client: WsTransporter) {
    try {
      const allChats = await client.getChats();

      console.log(allChats);
    } catch (e) {
      console.error(e);
    }
  }

  async logoutSession(client: WsTransporter) {
    try {
      await client.logout();

      console.log('Se cierra la sessión');
    } catch (e) {
      console.error(e);
    }
  }

  private generateQrCode(client: WsTransporter) {
    client.on('qr', (qr) => {
      console.log('Escanea el código QR que está en la carpeta tmp.');
      this.generateImage(qr);
    });
  }
}

export default WsTransporter;
