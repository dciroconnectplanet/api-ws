import { io } from '../server';
import { IGenerateQr } from '../types';

/**
 * Emite el valor del qr
 * @param data
 */
export const emitLoginQr = (data: IGenerateQr) => {
  io.emit('qr', data);
};
