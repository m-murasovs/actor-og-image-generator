const Apify = require('apify');
const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();

    // Start the browser
    log.info('Opening the browser.');
    const browser = await Apify.launchPuppeteer();

    // Open new tab in the browser
    const page = await browser.newPage();

    await page.setViewport({
        width: 2560,
        height: 1600,
        deviceScaleFactor: input.scale,
    });

    // Navigate to the URL
    log.info(`Navigating to ${input.actorUrl}.`);
    await page.goto(input.actorUrl);

    // Hide the breadcrumb and actor description
    await page.evaluate(() => { document.querySelector('.Header__Breadcrumb-kpuar6-4').style.visibility = 'hidden' });

    await page.evaluate(() => { document.querySelector('.actor-description').style.display = 'none' });

    // Add whitespace around the card to look better in the screenshot
    await page.evaluate(() => { document.querySelector('.og-image-section').style.padding = '5rem' });

    const screenshotCoordinates = await page.evaluate(() => {

        const { x, y, width, height } = document.querySelector('.og-image-section').getBoundingClientRect();

        return { x, y, width, height };
    });

    // Capture the screenshot
    log.info('Capturing screenshot.');
    const screenshot = await page.screenshot({
        // Adjust width to eliminate whitespace on the right
        clip: {
            x: screenshotCoordinates.x,
            y: screenshotCoordinates.y,
            width: screenshotCoordinates.width - 150,
            height: screenshotCoordinates.height
        },
        type: input.type,
        omitBackground: input.omitBackground,
    });

    // Add a message to dataset to show that process was successful
    await Apify.pushData({ status: 'Success! The image is in the run\'s key-value store.' });
    // Save the screenshot to the default key-value store
    await Apify.setValue('OUTPUT', screenshot, { contentType: `image/${input.type}` });

    // Close Puppeteer
    log.info('Done.');
    await browser.close();
});
