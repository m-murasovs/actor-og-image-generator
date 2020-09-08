const Apify = require('apify');
const { utils: { log } } = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();

    // Start the browser
    log.info('Opening the browser.');
    const browser = await Apify.launchPuppeteer();

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

    //Grab the actor info
    const actorTitle = await detailPage.evaluate(() => document.querySelector('.Text__H2-sc-1f839r4-1').innerText );
    
    const codeTitle = await detailPage.evaluate(() => document.querySelector('.xAtsI').innerText );

    const actorImageSrc = await detailPage.evaluate(() => document.querySelector('.Header__StyledImg-kpuar6-1').src );

    const authorPicture = await detailPage.evaluate(() => document.querySelector('.Content__AuthorWrap-sc-1r0kza0-1 > a > img').src );

    const authorLink = await detailPage.evaluate(() => document.querySelector('.Content__AuthorWrap-sc-1r0kza0-1 > a').href );

    // Navigate to author page to get full name
    const authorPage = await browser.newPage();
    log.info(`Navigating to author page.`);
    await authorPage.goto(authorLink);
    const authorFullName = await authorPage.evaluate(() => document.querySelector('.Text__H2-sc-1f839r4-1').innerText );


    // Generate HTML for the screenshot
    const resultPage = await browser.newPage();
    
    await resultPage.evaluate((actorTitle, codeTitle, actorImageSrc, authorPicture, authorFullName) => { 
        // Create and append the container
        const backgroundContainer = document.createElement('div');
        
        const imageContainer = document.createElement('div');
        const actorImageCircle = document.createElement('span');
        const actorCoverImg = document.createElement('img');
        actorCoverImg.src = actorImageSrc;
        
        const descriptionContainer = document.createElement('div');
        const titleContainer = document.createElement('div');
        const titleText = document.createElement('h1');
        titleText.innerText = actorTitle;
        
        const authorInfoContainer = document.createElement('div');
        const authorInfoSpan = document.createElement('span');
        const authorImg = document.createElement('img');
        const authorName = document.createElement('p');
        const actorCodeTitle = document.createElement('p');
        actorCodeTitle.innerText = codeTitle;
        authorImg.src = authorPicture;
        authorName.innerText = authorFullName;
        
        const tryButtonContainer = document.createElement('div');
        const tryButton = document.createElement('button');
        tryButton.innerText = 'Try for free';
        
        // Set background of Apify branding
        // TODO find a way to use local images or store the image on GitHub then use direct link
        backgroundContainer.setAttribute('style', `
            background-image: url("https://raw.githubusercontent.com/m-murasovs/actor-og-image-generator/master/src/background-smaller.png");
            object-fit: scale-down;
            background-position: 90% 90%;
            display: grid;
            grid-template-columns: 25% 75%;
            width: 100%;
            height: 100%;
            font-family: Graphik-regular;
        `);
        
        imageContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            display: grid;
        `);

        actorImageCircle.setAttribute('style', `
            margin: 70% auto;
            width: 13rem;
            height: 13rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgb(255, 255, 255);
            box-shadow: rgba(0, 29, 93, 0.2) 10px 10px 24px -4px;
            overflow: hidden;
        `);
        
        actorCoverImg.setAttribute('style', `
            width: 7rem !important;
        `);
        
        descriptionContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-rows: 2fr 1.2fr 1.5fr;
        `);
        
        titleContainer.setAttribute('style', `
            display: flex;
            align-items: flex-end;
        `);
        
        titleText.setAttribute('style', `
            font-size: 4.6rem;
            font-weight: 600;
            margin: 0;
            padding: 0;
        `);

        authorInfoContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            font-size: 2rem;
        `);
        
        actorCodeTitle.setAttribute('style', `
            padding: 0;
            margin: 1.5rem 0 1rem 0;
        `);

        authorInfoSpan.setAttribute('style', `
            display: flex;
            height: 3rem;
        `);
        
        authorName.setAttribute('style', `
            font-weight: 600;
            padding: 0;
            margin: 0;
        `);

        authorImg.setAttribute('style', `
            width: 3rem;
            border-radius: 50%;
            display: inline-block;
            margin: 0 1rem 0 1rem;
            padding: 0;
        `);

        tryButton.setAttribute('style', `
            white-space: nowrap;
            padding: 1.5rem 3rem;
            margin-top: 2rem;
            transition-property: background-color;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
            opacity: 1;
            border-radius: 1rem;
            border: 0px none;
            font-weight: 500;
            align-items: center;
            vertical-align: text-bottom;
            cursor: pointer;
            font-size: 2rem;
            width: auto;
            text-align: center;
            background: rgb(20, 128, 255) none repeat scroll 0% 0%;
            color: rgb(255, 255, 255);
        `);
        
        document.body.appendChild(backgroundContainer);
        backgroundContainer.append(imageContainer, descriptionContainer);
        descriptionContainer.append(titleContainer, authorInfoContainer, tryButtonContainer);
        titleContainer.append(titleText);
        imageContainer.append(actorImageCircle);
        actorImageCircle.append(actorCoverImg);
        authorInfoContainer.append(actorCodeTitle, authorInfoSpan);
        authorInfoSpan.append(authorName, authorImg);
        tryButtonContainer.append(tryButton);

    }, 
        actorTitle,
        codeTitle,
        actorImageSrc,
        authorPicture,
        authorFullName
    );
    

    




    const screenshot = await resultPage.screenshot()


    // Get box coordinates
    // const screenshotCoordinates = await page.evaluate(() => {

    //     const { x, y, width, height } = document.querySelector('.og-image-section').getBoundingClientRect();

    //     return { x, y, width, height };
    // });

    // Capture the screenshot
    log.info('Capturing screenshot.');
    // const screenshot = await page.screenshot({
    //     // Adjust width to eliminate whitespace on the right
    //     clip: {
    //         x: screenshotCoordinates.x,
    //         y: screenshotCoordinates.y,
    //         width: screenshotCoordinates.width -150,
    //         height: screenshotCoordinates.height
    //     },
    //     type: input.type,
    //     omitBackground: input.omitBackground,
    // });

    // Add a message to dataset to show that process was successful
    await Apify.pushData({ status: 'Success! The image is in the run\'s key-value store.' });
    // Save the screenshot to the default key-value store
    await Apify.setValue('OUTPUT', screenshot, { contentType: `image/${input.type}` });

    

    // Close Puppeteer
    log.info('Done.');
    await browser.close();
});
