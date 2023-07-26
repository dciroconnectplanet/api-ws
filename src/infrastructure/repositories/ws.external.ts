import { cwd } from 'node:process';
import { join } from 'path';

import { image as imageQr } from 'qr-image';
import { v4 as uuid } from 'uuid';
import {
  Client,
  LocalAuth,
  type Message,
  type Chat,
  MessageMedia,
} from 'whatsapp-web.js';

import LeadExternal from '../../domain/lead-external.repository';
import { emitLoginQr } from '../../sockets';
import type { IAttachFile } from '../../types';
import { convertQrImgToBase64 } from '../../utils';

/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth({ clientId: uuid() }),
      takeoverOnConflict: true,
      takeoverTimeoutMs: 0,
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--unhandled-rejections=strict',
        ],
      },
    });

    this.initializeClient(this);
    console.log('Iniciando....');

    this.on('ready', async () => {
      this.status = true;
      console.log('LOGIN_SUCCESS');

      emitLoginQr({
        loginSuccess: true,
        qrImage: '',
      });
    });

    this.on('auth_failure', async () => {
      this.status = false;
      console.log('LOGIN_FAIL');

      this.initializeClient(this);
    });

    this.on('qr', (qr) => {
      this.generateImage(qr);
    });

    this.on('disconnected', async (reason) => {
      console.log('Client disconected: ', reason);
      // Destroy and reinitialize the client when disconnected
      try {
        await this.destroy();
      } catch (error) {
        console.log('catched');
      }
      this.initializeClient(this);
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
  async sendMsg(lead: {
    message: string;
    phone: string;
    attach: IAttachFile;
  }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: 'WAIT_LOGIN' });
      const { message, phone, attach } = lead;
      let response: Message;
      if (attach.base64 && attach.type) {
        const media = new MessageMedia(attach.type, attach.base64);
        response = await this.sendMessage(`${phone}@c.us`, media, {
          caption: message,
        });
      } else {
        response = await this.sendMessage(`${phone}@c.us`, message);
      }

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

    const response = {
      loginSuccess: false,
      qrImage: convertQrImgToBase64(),
    };

    emitLoginQr(response);
  };

  private initializeClient(client: WsTransporter) {
    client.initialize().catch(console.error);
  }

  private async getAllChats(client: WsTransporter) {
    try {
      const chats: Chat[] = await client.getChats();
      const users = chats
        .filter(({ id: { user } }) => user)
        .map(({ id: { user }, name }) => ({ phone: user, name }));

      console.log({ users });
    } catch (error) {
      console.error(error);
    }
  }
}

export default WsTransporter;
