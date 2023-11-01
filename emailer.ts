import nodemailer from 'nodemailer';
import { ScrapeResult } from './costcoScraper';
import Mail from 'nodemailer/lib/mailer';

const CLIENT_ID = process.env.GMAIL_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_API_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const SENDING_ADDRESS = 'costcochecker123@gmail.com';
const FORMATTED_SENDING_ADDRESS = `Costco Checker <${SENDING_ADDRESS}>`;
const RECIPIENT_ADDRESSES = process.env.RECIPIENT_ADDRESSES?.split(',');

export type FormattedItem = {
  name: string;
  attachments: Mail.Attachment[];
};

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

// TODO: Could decouple the emailer from the scraper by not using the ScrapeResult type and having the invoker of
// sendEmailWithImages handle transforming the result of the scraper for usage here. OK for now though.
export const sendEmailWithImages = async (scrapeResult: ScrapeResult) => {
  const transporter = generateTransport();

  const formattedItems: FormattedItem[] = scrapeResult.map(
    (searchQueryResult, i) => {
      return {
        name: searchQueryResult.searchQuery,
        attachments: searchQueryResult.images.map((imageBuffer) => {
          return {
            filename: `${searchQueryResult.searchQuery}-${i}.png`,
            content: imageBuffer,
            cid: `costco-${i}`,
          };
        }),
      };
    }
  );
  const email = generateItemSummaryEmail(formattedItems);

  await transporter.sendMail({
    from: FORMATTED_SENDING_ADDRESS,
    to: RECIPIENT_ADDRESSES,
    html: email,
    subject: `Costco Checker Results for ${new Date().toDateString()}`,
    attachments: formattedItems.reduce((result, formattedItem) => {
      return [...result, ...formattedItem.attachments];
    }, [] as Mail.Attachment[]),
  });
};

// This should probably be pulled out into a separate class and resulting HTML passed into the emailer instead of being generated here
const generateItemSummaryEmail = (formattedImages: FormattedItem[]) => {
  return `<html>${genereateItemSummaries(formattedImages)}</html>`;
};

const genereateItemSummaries = (formattedItems: FormattedItem[]) => {
  return formattedItems.reduce((summaryHtml, formattedItem) => {
    const imageHtml = generateImageHtml(formattedItem.attachments);
    return (
      summaryHtml +
      `<p>Results for <b>${formattedItem.name}</b></p>${imageHtml}`
    );
  }, '');
};

const generateImageHtml = (images: Mail.Attachment[]) => {
  return images.reduce(
    (currentHtml, image) =>
      (currentHtml += `<p><img src="cid:${image.cid}"/></p>`),
    ''
  );
};
