import type { IAttachFile } from '../types';

export default interface LeadExternal {
  sendMsg({
    message,
    phone,
    attach,
  }: {
    message: string;
    phone: string;
    attach: IAttachFile;
  }): Promise<any>;
}
