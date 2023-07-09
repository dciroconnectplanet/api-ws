import { Router } from 'express';

import type LeadCtrl from '../controller/lead.ctrl';
import container from '../ioc';
import type WsTransporter from '../repositories/ws.external';

const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get('lead.ctrl');
router.post('/', leadCtrl.sendCtrl);

router.get('/', (req, res) => {
  try {
    const wsTrasporter: WsTransporter = container.get('ws.transporter');
    return res.json({ isLoggin: wsTrasporter.getStatus() });
  } catch (error) {
    console.error(error);
    return { isLoggin: false };
  }
});

export { router };
