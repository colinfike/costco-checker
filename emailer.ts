import nodemailer from 'nodemailer';

const CLIENT_ID = process.env.GMAIL_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_API_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const SENDING_ADDRESS = 'costcochecker123@gmail.com';
const FORMATTED_SENDING_ADDRESS = `Costco Checker <${SENDING_ADDRESS}>`;
const RECIPIENT_ADDRESSES = process.env.RECIPIENT_ADDRESSES?.split(',');

const generateTransport = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: SENDING_ADDRESS,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
    },
  });

export const sendEmailWithImages = async (
  body: string,
  imageBuffers: Buffer[]
) => {
  const transporter = generateTransport();

  const formattedAttachments = imageBuffers.map((imageBuffer, i) => {
    return { filename: `image-${i}.png`, content: imageBuffer };
  });

  await transporter.sendMail({
    from: FORMATTED_SENDING_ADDRESS,
    to: RECIPIENT_ADDRESSES,
    html: body,
    subject: body,
    attachments: formattedAttachments,
  });
};
