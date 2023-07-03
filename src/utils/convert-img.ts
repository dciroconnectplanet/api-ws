import { readFile } from 'fs/promises';
import { join } from 'path';

export const convertQrImgToBase64 = async () => {
  const qrPath = join(process.cwd(), 'tmp', 'qr.svg');
  return await readFile(qrPath, 'base64');
};
