import { io } from '../server';

export const updateQrImage = (qrInfo: IGenerateQr) => {
  io.emit('qr', qrInfo);
};

interface IGenerateQr {
  loginSuccess: boolean;
  qrImage: string
}
