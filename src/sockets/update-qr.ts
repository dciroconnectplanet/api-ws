import { io } from '../server';
import { convertQrImgToBase64 } from '../utils';

export const updateQrImage = () => {
  io.emit('message', { image: convertQrImgToBase64() })
};

export const loginSuccess = (loginSuccess: boolean) =>  {
  io.emit('login', { loginSuccess })
}
