import { io } from '../server';

export const updateQrImage = ({ loginSuccess }: IGenerateQr) => {
  io.emit('qr', { loginSuccess });
};

interface IGenerateQr {
  loginSuccess: boolean;
}
