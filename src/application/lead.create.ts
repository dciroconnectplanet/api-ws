import LeadExternal from "../domain/lead-external.repository";
import LeadRepository from "../domain/lead.repository";
import type { IAttachFile } from '../types';

export class LeadCreate {
  private leadRepository: LeadRepository;
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadRepository, LeadExternal]) {
    const [leadRepository, leadExternal] = respositories;
    this.leadRepository = leadRepository;
    this.leadExternal = leadExternal;
  }

  public async sendMessageAndSave({
    message,
    phone,
    attach
  }: {
    message: string;
    phone: string;
    attach: IAttachFile
  }) {
    const responseDbSave = await this.leadRepository.save({ message, phone });//TODO DB
    const responseExSave = await this.leadExternal.sendMsg({ message, phone, attach });//TODO enviar a ws
    return {responseDbSave, responseExSave};
  }
}
