import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email";
import { EmailSubjectEnum } from "../../enum";
import { verifyEmailTemplate } from "./template/email.templates";

export const emailEvent = new EventEmitter();

emailEvent.on(
  "send-Email",
  async ({
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    recipients,
    data,
  }: {
    subject?: EmailSubjectEnum;
    recipients: { to?: string[], cc?: string[], bcc?: string[] };
    data: any;
  }) => {
    try {
      await sendEmail({...recipients , subject , html : verifyEmailTemplate({subject,title: subject,code: data.code,}),});
    } catch (error) {
      console.log(error);
    }
  }
);