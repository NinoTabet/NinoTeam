require('dotenv').config();
const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const puppeteer = require('puppeteer'); // Import Puppeteer
const PORT = process.env.PORT;
app.use(express.json(), cors());

const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktokUsername = "nino8291";
let gifterNames = [];
let openTabs = []; // Store tab references
const url = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';

// Launch a single browser instance
let browser;
async function launchBrowser() {
    if (!browser || !browser.isConnected()) {
        browser = await puppeteer.launch({ headless: false }); // Open Chrome
    }
}

// Open YouTube and track the tab
async function youtube() {
    await launchBrowser();
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" }); // Wait for page to fully load

    // Execute JavaScript inside the page to play the video
    await page.evaluate(() => {
        const video = document.querySelector("video");
        if (video) {
            video.play().catch(err => console.error("Playback failed:", err));
        }
    });

    openTabs.push(page);
    console.log(`Opened ${openTabs.length} YouTube tabs.`);

    setTimeout(() => {
        closeSpecificTab();
    }, 9000);
}

// Close the last opened tab
async function closeSpecificTab() {
    if (openTabs.length > 0) {
        const page = openTabs.pop(); // Get the last tab
        await page.close(); // Close tab
        console.log("Closed one YouTube tab.");
        
        if (openTabs.length === 0) {
            await browser.close(); // Close browser if no tabs remain
            console.log("Browser closed.");
        }
    }
}

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 1000,
    clientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
});

// Connect to the chat
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// Listen for gifts
tiktokLiveConnection.on('gift', async (data) => {
    if (data.giftType === 1 && !data.repeatEnd) return;

    if (data.diamondCount * data.repeatCount > 4) {
        await youtube();
    }

    gifterNames.push({
        userId: data.uniqueId,
        diamondCount: data.diamondCount * data.repeatCount
    });
});

// Listen for chat messages
tiktokLiveConnection.on('chat', data => {
    for (let i = gifterNames.length - 1; i >= 0; i--) {
        if (data.uniqueId === gifterNames[i].userId && gifterNames[i].diamondCount > 1) {
            console.log(`${data.uniqueId}: ${data.comment}`);
            gifterNames.splice(i, 1);
        }
    }
});

// Uncomment to enable Express server
// app.listen(PORT || 3000, () => {
//     console.log(`Server is running on port 3000`);
// });
