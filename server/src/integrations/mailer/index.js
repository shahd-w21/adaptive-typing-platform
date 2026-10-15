import nodemailer from 'nodemailer';

export function createMailer(config) {
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST, port: config.SMTP_PORT, secure: config.SMTP_PORT === 465,
    ...(config.SMTP_USER ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } } : {}),
    connectionTimeout: 5000, socketTimeout: 10000,
  });
  return message => transport.sendMail({ from: config.MAIL_FROM, ...message });
}
