import { Request, Response } from 'express';

import { LeadCreate } from '../../application/lead.create';
import { ISendBulkMessage, ISendBulkMessageWithAttach } from '../../types';

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const { content, attach } = body as ISendBulkMessageWithAttach;
    const response: any[] = [];

    for (const { fullName, phone } of content) {
      const message = `!Hola, ${fullName}! Soy {Candidato} aspirante a la alcaldia de {Municipio}, queremos recordar que estamos en campaña y puedes ver nuestras promesas de campaña ingresando al sitio web {SitioWeb}. Recuerda estan diseñadas para tí.`;

      const sentResponse = await this.leadCreator.sendMessageAndSave({
        message,
        phone,
        attach
      });

      response.push(sentResponse);
    }

    res.send(response);
  };
}

export default LeadCtrl;
