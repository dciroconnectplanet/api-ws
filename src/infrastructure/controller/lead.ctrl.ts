import { Request, Response } from 'express';

import { LeadCreate } from '../../application/lead.create';
import { ISendBulkMessage } from '../../types';

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const receiveMessage = body as ISendBulkMessage[];
    const response: any[] = [];

    for (const { fullName, phone } of receiveMessage) {
      const message = `!Hola, ${fullName}! Soy {Candidato} aspirante a la alcaldia de {Municipio}, queremos recordar que estamos en campaña y puedes ver nuestras promesas de campaña ingresando al sitio web {SitioWeb}. Recuerda estan diseñadas para tí.`;

      const sentResponse = await this.leadCreator.sendMessageAndSave({
        message,
        phone,
      });

      response.push(sentResponse);
    }

    res.send(response);
  };
}

export default LeadCtrl;
