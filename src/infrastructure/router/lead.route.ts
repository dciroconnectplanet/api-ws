import { Router } from 'express';

import { IGenerateQr } from '../../types';
import { convertQrImgToBase64 } from '../../utils';
import LeadCtrl from '../controller/lead.ctrl';
import container from '../ioc';
import type WsTransporter from '../repositories/ws.external';

const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get('lead.ctrl');
router.post('/', leadCtrl.sendCtrl);
router.get('/', async (req, res) => {
  const ws: WsTransporter = container.get('ws.transporter');

  const response: IGenerateQr = {
    loginSuccess: ws.getStatus(),
    qrImage: await convertQrImgToBase64(),
  };

  res.status(200).json(response);
});

export { router };
