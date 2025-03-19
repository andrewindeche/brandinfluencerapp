import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class SendForgotPasswordEmailService {
  private transporter;

  constructor() {
    this.initializeTransporter(); // Initialize transporter on service creation
  }

  private async initializeTransporter() {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  async sendEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: '"Support Team" <no-reply@example.com>',
      to: to,
      subject: 'Password Recovery',
      text: `Click on the following link to reset your password: ${resetLink}`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    const info = await this.transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}