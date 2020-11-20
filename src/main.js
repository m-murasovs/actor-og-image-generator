const Apify = require('apify');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();
    const { debug } = input;
    // Start the browser
    log.info('Opening the browser.');
    const browser = await Apify.launchPuppeteer({
        headless: true,
    });

    // Open new tab in the browser
    const detailPage = await browser.newPage();

    await detailPage.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: input.scale,
    });

    // Navigate to the URL
    log.info(`Navigating to ${input.actorUrl}.`);
    await detailPage.goto(input.actorUrl);

    // Grab the actor info
    const actorTitle = await detailPage.evaluate(() => document.querySelector('[class^=Text__H2]').innerText);

    const codeTitle = await detailPage.evaluate(() => document.querySelector('[class^=DetailHeaderTop] [class^=Text__Paragraph]').innerText);

    const actorImageSrc = await detailPage.evaluate(() => document.querySelector('[class^=Header__StyledImg]').src);

    const authorPictureAddress = await detailPage.evaluate(() => document.querySelector('[class^=Content__AuthorWrap] a img').src);

    const authorLink = await detailPage.evaluate(() => document.querySelector('[class^=Content__AuthorWrap] a').href);

    // Navigate to author page to get full name
    const authorPage = await browser.newPage();
    log.info('Navigating to author page.');
    await authorPage.goto(authorLink);
    const authorFullName = await authorPage.evaluate(() => document.querySelector('[class^=Text__H2]').innerText);

    // Generate HTML for the screenshot
    const resultPage = await browser.newPage();

    await resultPage.evaluate((actorTitle, codeTitle, actorImageSrc, authorPictureAddress, authorFullName) => {
        // Import CSS
        const head = document.getElementsByTagName('HEAD')[0];
        const styleCustom = document.createElement('style');
        styleCustomBold = '@font-face {font-family: "Graphik-bold" ;src: url("https://apify.com/fonts/Graphik-Bold-Web.woff2"); /*URL to font*/}';
        head.append(styleCustom);
        styleCustom.innerHTML = '@font-face {font-family: "Graphik-semibold" ;src: url("https://apify.com/fonts/Graphik-Semibold-Web.woff2"); /*URL to font*/}';
        head.append(styleCustom);
        styleCustom.innerHTML = '@font-face {font-family: "Graphik" ;src: url("https://apify.com/fonts/Graphik-Regular-Web.woff2"); /*URL to font*/}';
        head.append(styleCustom);

        // Old version of appending the font
        /*        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/Graphik-Regular.otf';
        head.appendChild(link); */

        // Create the elements
        const backgroundContainer = document.createElement('div');

        const logo = document.createElement('span');
        // Had trouble getting the background image to work on platform, so did this workaround to get the logo
        logo.innerHTML = '<svg width="152px" height="40px" viewBox="0 0 152 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>logo-full-gray</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-full-gray" fill-rule="nonzero"><path d="M89.597,20.667 L83.92,20.667 L83.92,13.045 L89.599,13.045 C91.697,13.045 93.399,14.752 93.399,16.856 C93.4003269,17.8655873 93.0004736,18.834337 92.2874314,19.5490671 C91.5743892,20.2637971 90.6065876,20.6659398 89.597,20.667 Z M90.171,9 L78.75,9 L78.75,32 L83.919,32 L83.919,24.712 L90.169,24.712 C94.497,24.712 98.005,21.195 98.005,16.856 C98.005,12.517 94.498,9 90.17,9 L90.171,9 Z M110.146,32 L115.313,32 L115.313,23.843 L124.648,23.843 L124.648,19.698 L115.313,19.698 L115.313,13.246 L126.915,13.246 L126.915,9 L110.145,9 L110.145,32 L110.146,32 Z M146.499,9 L140.864,18.46 L140.731,18.46 L135.364,9 L129.496,9 L138.098,23.275 L138.098,32 L143.298,32 L143.298,23.242 L152,9 L146.499,9 Z M101.079,32 L106.247,32 L106.247,9 L101.079,9 L101.079,32 Z M61.269,23.208 L64.469,13.78 L64.602,13.78 L67.736,23.208 L61.268,23.208 L61.269,23.208 Z M61.534,9 L53,32 L58.301,32 L59.901,27.287 L69.103,27.287 L70.703,32 L76.171,32 L67.636,9 L61.535,9 L61.534,9 Z" id="Shape" fill="#212322"></path><path d="M5.309,4.755 C1.939,5.187 -0.411,8.042 0.06,11.133 L3.696,35 L19,3 L5.309,4.755 Z" id="Shape" fill="#97D700"></path><path d="M39.986,23.133 L38.689,5.145 C38.458,1.947 35.545,-0.39 32.342,0.055 L27,0.794 L38.765,27 C39.6490537,25.9132762 40.0853691,24.5302994 39.985,23.133" id="Shape" fill="#71C5E8"></path><path d="M9,39.965 C9.99043651,40.0730706 10.9921479,39.9303619 11.913,39.55 L33,30.886 L22.975,9 L9,39.965 Z" id="Shape" fill="#FF9013"></path></g></g></svg>';

        const imageContainer = document.createElement('div');
        const actorImageCircle = document.createElement('span');
        const actorCoverImage = document.createElement('img');
        actorCoverImage.src = actorImageSrc;

        const actorDescriptionContainer = document.createElement('div');
        const actorTitleContainer = document.createElement('div');
        const actorTitleText = document.createElement('h1');
        actorTitleText.innerText = actorTitle;

        const authorInfoContainer = document.createElement('div');
        const actorCodeTitle = document.createElement('div');
        const authorNameAndImageContainer = document.createElement('span');
        const authorProfileImage = document.createElement('img');
        const authorName = document.createElement('p');
        actorCodeTitle.innerText = codeTitle;
        authorProfileImage.src = authorPictureAddress;
        authorName.innerText = authorFullName;

        const tryButtonContainer = document.createElement('div');
        const tryButton = document.createElement('button');
        const buttonText = document.createElement('span');
        buttonText.innerText = 'Try for free';
        // Add SVG triangle code
        tryButton.innerHTML = '<svg viewBox="0 0 448 512" width="0.7em" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="sc-AxjAm fepPFp"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>';

        // Set styles for the elements
        document.body.setAttribute('style', `
            overflow: hidden;
            padding: 0;
            margin: 0;
        `);

        backgroundContainer.setAttribute('style', `
            background: linear-gradient(128deg, rgba(2,0,36,1) 0%, rgba(240,248,254,1) 0%, rgba(255,255,255,1) 100%);
            padding: 0 0 0 1rem;
            margin: 0;
            background-position: 90% 90%;
            display: grid;
            grid-template-columns: 25% 75%;
            width: 100%;
            height: 100%;
            font-family: 'Graphik', sans-serif;
            font-size: 2rem;
        `);

        logo.setAttribute('style', `
            position: absolute;
            right: 6rem;
            bottom: 3rem;
            transform: scale(1.3); 
        `);

        imageContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            display: grid;
        `);

        actorImageCircle.setAttribute('style', `
            margin: 45% auto;
            width: 12rem;
            height: 12rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgb(255, 255, 255);
            box-shadow: rgba(0, 29, 93, 0.2) 10px 10px 24px -4px;
            overflow: hidden;
        `);

        actorCoverImage.setAttribute('style', `
            width: 6rem !important;
        `);

        actorDescriptionContainer.setAttribute('style', `
            padding 0;
            margin: 0;
        `);

        actorTitleContainer.setAttribute('style', `
            padding-right: 2.5rem;
        `);

        actorTitleText.setAttribute('style', `
            font-family: 'Graphik-bold', sans-serif;
            font-size: 4.5rem;
            margin: 15% 0 2rem 0;
            padding: 0;
            line-height: 1;
        `);

        authorInfoContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
        `);

        actorCodeTitle.setAttribute('style', `
            padding: 0;
            margin: 3rem 0 1rem 0;
            font-weight: 400;
        `);

        authorNameAndImageContainer.setAttribute('style', `
            display: flex;
            align-items: center;
            height: 3rem;
            margin-top: 1rem;
        `);

        authorName.setAttribute('style', `
            font-family: 'Graphik-semibold', sans-serif;
            padding: 0;
            margin: 0;
        `);

        authorProfileImage.setAttribute('style', `
            width: 3rem;
            border-radius: 50%;
            display: inline-block;
            margin: 0 1rem 0 0;
            padding: 0;
        `);

        tryButton.setAttribute('style', `
            display: flex;
            white-space: nowrap;
            padding: 2rem 3.5rem;
            margin-top: 4rem;
            transition-property: background-color;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
            opacity: 1;
            border-radius: 0.7rem;
            border: 0px none;
            font-weight: 500;
            align-items: center;
            cursor: pointer;
            font-size: 2rem;
            width: auto;
            text-align: center;
            background: rgb(151, 215, 0) none repeat scroll 0% 0%;
            color: rgb(255, 255, 255);
            box-shadow: rgba(0, 29, 93, 0.2) 8px 8px 12px -4px;
        `);

        buttonText.setAttribute('style', `
            padding: 0;
            margin: 0 0 0 0.5rem;
        `);

        document.body.appendChild(backgroundContainer);
        backgroundContainer.append(imageContainer, actorDescriptionContainer, logo);
        imageContainer.append(actorImageCircle);
        actorImageCircle.append(actorCoverImage);
        actorDescriptionContainer.append(actorTitleText, actorCodeTitle, tryButtonContainer);
        actorCodeTitle.append(authorNameAndImageContainer);
        authorNameAndImageContainer.append(authorProfileImage, authorName);
        tryButtonContainer.append(tryButton);
        tryButton.append(buttonText);
    },
        actorTitle,
        codeTitle,
        actorImageSrc,
        authorPictureAddress,
        authorFullName);

    const screenshot = await resultPage.screenshot({
        type: input.type,
    });
    if (debug) {
        // slow down
        await Apify.utils.sleep(1000);
        await resultPage.evaluateHandle('document.fonts.ready');
        // store html for debug
        const pageHtml = await resultPage.evaluate(async () => {
            return document.documentElement.innerHTML;
        });
        await Apify.setValue('testHtml', pageHtml, { contentType: 'text/html' });
    }

    // Optimize image
    const imagminPlugins = input.type === 'png'
        ? [imageminPngquant({ quality: [0.8, 0.95] })]
        : [imageminJpegtran()];
    const image = await imagemin.buffer(screenshot, {
        plugins: imagminPlugins,
    });

    // Capture the screenshot
    log.info('Capturing screenshot.');

    // Add a message to dataset to show that process was successful
    await Apify.pushData({ status: 'Success! The image is in the run\'s key-value store.' });
    // Save the screenshot to the default key-value store
    await Apify.setValue('OUTPUT', image, { contentType: `image/${input.type}` });

    // Close Puppeteer
    log.info('Done.');
    await browser.close();
});
