import { chromium } from 'playwright';

const COSTCO_SAMEDAY_URL = 'https://sameday.costco.com/';
const ZIPCODE_FIELD_PLACEHOLDER = 'Enter ZIP code';
const HOME_ZIPCODE = '94110';
const SEARCHBAR_PLACEHOLDER = 'Search Costco...';

export const fetchImagesForQueryStrings = async (
  queryStrings: string[]
): Promise<Buffer[]> => {
  // Navigate to Costco Instacart page
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(COSTCO_SAMEDAY_URL);

  // Enter in local zipcode and submit
  const zipCodeTextField = await page.getByPlaceholder(
    ZIPCODE_FIELD_PLACEHOLDER
  );
  await zipCodeTextField.fill(HOME_ZIPCODE);
  const submitButton = await page.locator('BUTTON[type="submit"]');
  await submitButton.click();

  const matchedItemImages: Buffer[] = [];
  // Search for for query strings and take screenshot of any found elements for later review.
  // TODO: Probably cleaner to make a class and break up this function.
  for (const queryString of queryStrings) {
    const searchCostcoField = await page.getByPlaceholder(
      SEARCHBAR_PLACEHOLDER
    );
    await searchCostcoField.fill(queryString);
    await searchCostcoField.press('Enter');

    const queryStringRegex = new RegExp(queryString, 'i');
    const matchedItems = page
      .getByRole('button')
      .filter({ hasText: queryStringRegex });

    // Need to wait for dynamic elements to load
    try {
      await matchedItems.waitFor({ timeout: 10000 });
    } catch (err: any) {
      if (err.name === 'TimeoutError') {
        console.log(`TimeoutError encountered looking for ${queryString}`);
        continue;
      }
    }

    for (let i = 0; i < (await matchedItems.count()); i++) {
      matchedItemImages.push(await matchedItems.nth(i).screenshot());
    }
  }

  await browser.close();

  return matchedItemImages;
};
