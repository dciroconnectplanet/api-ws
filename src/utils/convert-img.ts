import { readFileSync } from 'fs';
import { join } from 'path';

export const convertQrImgToBase64 = () => {
  const qrPath = join(process.cwd(), 'tmp', 'qr.svg');
  return readFileSync(qrPath, 'base64');
};
