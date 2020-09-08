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
        // Import CSS
        var head = document.getElementsByTagName('HEAD')[0];  
        var link = document.createElement('link'); 
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/Graphik-Regular.otf';
        head.appendChild(link);
        
        // Create the elements
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
        const authorNameAndImageContainer = document.createElement('span');
        const authorImg = document.createElement('img');
        const authorName = document.createElement('p');
        const actorCodeTitle = document.createElement('p');
        actorCodeTitle.innerText = codeTitle;
        authorImg.src = authorPicture;
        authorName.innerText = authorFullName;
        
        const tryButtonContainer = document.createElement('div');
        const tryButton = document.createElement('button');
        const buttonText = document.createElement('span');
        buttonText.innerText = 'Try for free';
        tryButton.innerHTML = '<svg viewBox="0 0 448 512" width="0.7em" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="sc-AxjAm fepPFp"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>';
        
        // Set styles for the elements
        backgroundContainer.setAttribute('style', `
            background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1280px-Google_2015_logo.svg.png");
            padding: 0;
            margin: 0;
            background-position: 90% 90%;
            display: grid;
            grid-template-columns: 25% 75%;
            width: 100%;
            height: 100%;
            font-family: Graphik-regular, sans-serif;
        `);
        
        imageContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            display: grid;
        `);

        actorImageCircle.setAttribute('style', `
            margin: 45% auto;
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
            width: 8rem !important;
        `);
        
        descriptionContainer.setAttribute('style', `
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-rows: 1fr 1fr 1fr;
        `);
        
        titleContainer.setAttribute('style', `
            display: flex;
            align-items: flex-end;
        `);
        
        titleText.setAttribute('style', `
            font-size: 7rem;
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
            margin: 2.5rem 0 1rem 0;
        `);

        authorNameAndImageContainer.setAttribute('style', `
            display: flex;
            align-items: center;
            height: 3rem;
        `);
        
        authorName.setAttribute('style', `
            font-weight: 600;
            padding: 0;
            margin: 0;
        `);

        authorImg.setAttribute('style', `
            width: 4rem;
            border-radius: 50%;
            display: inline-block;
            margin: 0 1rem 0 1rem;
            padding: 0;
        `);

        tryButton.setAttribute('style', `
            display: flex;
            white-space: nowrap;
            padding: 2rem 3.5rem;
            margin-top: 1rem;
            transition-property: background-color;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
            opacity: 1;
            border-radius: 0.7rem;
            border: 0px none;
            font-weight: 500;
            align-items: center;
            cursor: pointer;
            font-size: 2.5rem;
            width: auto;
            text-align: center;
            background: rgb(151, 215, 0) none repeat scroll 0% 0%;
            color: rgb(255, 255, 255);
        `);

        buttonText.setAttribute('style', `
            padding: 0;
            margin: 0 0 0 0.5rem;
        `);
        
        document.body.appendChild(backgroundContainer);
        backgroundContainer.append(imageContainer, descriptionContainer);
        descriptionContainer.append(titleContainer, authorInfoContainer, tryButtonContainer);
        titleContainer.append(titleText);
        imageContainer.append(actorImageCircle);
        actorImageCircle.append(actorCoverImg);
        authorInfoContainer.append(actorCodeTitle, authorNameAndImageContainer);
        authorNameAndImageContainer.append(authorName, authorImg);
        tryButtonContainer.append(tryButton);
        tryButton.append(buttonText);

    }, 
        actorTitle,
        codeTitle,
        actorImageSrc,
        authorPicture,
        authorFullName
    );

    const screenshot = await resultPage.screenshot()

    // Capture the screenshot
    log.info('Capturing screenshot.');

    // Add a message to dataset to show that process was successful
    await Apify.pushData({ status: 'Success! The image is in the run\'s key-value store.' });
    // Save the screenshot to the default key-value store
    await Apify.setValue('OUTPUT', screenshot, { contentType: `image/${input.type}` });

    // Close Puppeteer
    log.info('Done.');
    await browser.close();
});
