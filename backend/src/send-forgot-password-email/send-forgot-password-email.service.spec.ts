import { SendForgotPasswordEmailService } from './send-forgot-password-email.service';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

jest.mock('nodemailer');

describe('SendForgotPasswordEmailService', () => {
  let service: SendForgotPasswordEmailService;
  let mockSendMail: jest.Mock;
  let mockGetTestMessageUrl: jest.SpyInstance;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue({
      user: 'testuser@ethereal.email',
      pass: 'testpass',
    });

    mockGetTestMessageUrl = jest
      .spyOn(nodemailer, 'getTestMessageUrl')
      .mockReturnValue('http://preview.url');

    service = new SendForgotPasswordEmailService();

    await (service as any).initializeTransporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize transporter with ethereal test account', async () => {
    expect(nodemailer.createTestAccount).toHaveBeenCalled();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'testuser@ethereal.email',
        pass: 'testpass',
      },
    });
  });

  it('should send email with correct content and return preview URL', async () => {
    const to = 'user@example.com';
    const resetLink = 'http://example.com/reset?token=abc123';

    const previewUrl = await service.sendEmail(to, resetLink);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Support Team" <no-reply@example.com>',
        to: to,
        subject: 'Password Recovery',
        text: expect.stringContaining(resetLink),
        html: expect.stringContaining(resetLink),
      }),
    );

    expect(previewUrl).toBe('http://preview.url');
    expect(mockGetTestMessageUrl).toHaveBeenCalled();
  });

  it('should return empty string if getTestMessageUrl returns null', async () => {
    mockGetTestMessageUrl.mockReturnValue(null);

    const result = await service.sendEmail('user@example.com', 'http://link');
    expect(result).toBe('');
  });
});
