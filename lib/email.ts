import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

function wrapMonospaceBlackAndWhiteHtml(content: string): string {
  const sanitizedContent = content.startsWith('<') ? content : content.replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      font-family: 'Courier New', Courier, monospace !important;
      color: #000000 !important;
      background-color: #ffffff !important;
      text-align: center !important;
    }
  </style>
</head>
<body style="margin:0; padding:40px 20px; background-color:#ffffff !important; color:#000000 !important; font-family:'Courier New', Courier, monospace !important; text-align:center !important;">
  <div style="width:100%; max-width:600px; margin:0 auto; background-color:#ffffff !important; color:#000000 !important; font-family:'Courier New', Courier, monospace !important; text-align:center !important;">
    ${sanitizedContent}
  </div>
</body>
</html>`.trim();
}

export async function sendMail(payload: EmailPayload): Promise<SendMailResult> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const transportOptions: nodemailer.TransportOptions | any = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

    const bodyContent = payload.html ? payload.html : (payload.text ? payload.text : '');
    const styledHtml = wrapMonospaceBlackAndWhiteHtml(bodyContent);

    const mailOptions = {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text ? payload.text : payload.html?.replace(/<[^>]+>/g, ''),
      html: styledHtml,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');

    return {
      success: true,
      messageId: info.messageId,
      details: info,
    };
  } catch (error: any) {
    console.error('Email sending failed:', error);

    return {
      success: false,
      error: error?.message ? error.message : String(error),
      details: error,
    };
  }
}
