import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

/*async function create() {
  const account = await nodemailer.createTestAccount();
  console.log(account);
}

create();*/

@Injectable()
export class SendForgotPasswordEmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  }

  async sendEmail(to: string, resetLink: string): Promise<string> {
    const mailOptions = {
      from: '"Support Team" <no-reply@example.com>',
      to: to,
      subject: 'Password Recovery',
      text: `Click on the following link to reset your password: ${resetLink}`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    const info = await this.transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return previewUrl || '';
  }
}
