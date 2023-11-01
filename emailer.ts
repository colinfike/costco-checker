import nodemailer from 'nodemailer';
import { ScrapeResult } from './costcoScraper';
import Mail from 'nodemailer/lib/mailer';

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
  scrapeResult: ScrapeResult
) => {
  const transporter = generateTransport();

  const formattedImages: FormattedSearchResults[] = scrapeResult.map(
    (searchQueryResult, i) => {
      return {
        searchQuery: searchQueryResult.searchQuery,
        images: searchQueryResult.images.map((imageBuffer) => {
          return {
            filename: `image-${i}.png`,
            content: imageBuffer,
            cid: `costco-${i}`,
          };
        }),
      };
    }
  );

  const email = generateSummaryEmail(formattedImages);

  await transporter.sendMail({
    from: FORMATTED_SENDING_ADDRESS,
    to: RECIPIENT_ADDRESSES,
    html: email,
    subject: `Costco Checker Results for ${new Date().toDateString()}`,
    attachments: formattedImages.reduce((result, formattedImage) => {
      return [...result, ...formattedImage.images];
    }, [] as Mail.Attachment[]),
  });
};

export type FormattedSearchResults = {
  searchQuery: string;
  images: Mail.Attachment[];
};

const generateSummaryEmail = (formattedImages: FormattedSearchResults[]) => {
  return `<html>${generateResultSummaries(formattedImages)}</html>`;
};

const generateResultSummaries = (formattedImages: FormattedSearchResults[]) => {
  let summaries = '';
  for (const formattedImage of formattedImages) {
    const imageHtml = generateImageHtml(formattedImage.images);
    summaries += `<p>Results for <b>${formattedImage.searchQuery}</b></p>${imageHtml}`;
  }
  return summaries;
};

const generateImageHtml = (images: Mail.Attachment[]) => {
  let imageHtml = '';
  for (const image of images) {
    imageHtml += `<p><img src="cid:${image.cid}"/></p>`;
  }
  return imageHtml;
};
