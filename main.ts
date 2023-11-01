/**
 * Costco Scraper
 *
 * Uses the Costco Instacart integration to capture images of products matching passed in query strings.
 *
 */

import { fetchImagesForQueryStrings } from './costcoScraper';
import { sendEmailWithImages } from './emailer';

const QUERY_STRINGS = process.env.QUERY_STRINGS?.split(',');

const main = async () => {
  if (!QUERY_STRINGS) {
    console.log(`No search terms passed in! Stopping!`);
    return;
  }

  console.log(`Running Costco Checker with ${QUERY_STRINGS}...`);
  const availableItemImages = await fetchImagesForQueryStrings(QUERY_STRINGS);
  const emailBody = `${availableItemImages.length} items have been found!`;

  await sendEmailWithImages(emailBody, availableItemImages);
};

main()
  .then(() => console.log(`Completed running Costo Checker!`))
  .catch((err) => {
    console.error('Error found running Costco Checker');
    console.error(err);
  });

/**
 * TODO
 * 1. Update email to have more information
 * 2. Update the prompts
 */
