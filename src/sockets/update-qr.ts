import { io } from '../server';
import { convertQrImgToBase64 } from '../utils';

export const updateQrImage = () => {
  io.emit('message', { image: convertQrImgToBase64() })
};
