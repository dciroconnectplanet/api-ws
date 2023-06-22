import { readFileSync } from 'fs';
import { join } from 'path';

export const convertQrImgToBase64 = () => {
  console.log({ currentDi: process.cwd() });
  const qrPath = join(process.cwd(), 'tmp', 'qr.svg');
  console.log({ qrPath });
  return readFileSync(qrPath, 'base64');
};
