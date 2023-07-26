export interface ISendBulkMessageWithAttach {
  content: ISendBulkMessage[];
  attach: IAttachFile;
}

export interface ISendBulkMessage {
  fullName: string;
  phone: string;
}

export interface IAttachFile {
  base64: string | null | undefined;
  type: string | null | undefined;
}
