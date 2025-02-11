require('dotenv').config();
const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const PORT = process.env.PORT;
app.use(express.json(), cors());

//
const { WebcastPushConnection } = require('tiktok-live-connector');

let tiktokUsername = "nino8291";
let gifterNames = [];

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 1000,
    clientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
    requestHeaders: {
        "headerName": "headerValue"
    },
    websocketHeaders: {
        "headerName": "headerValue"
    },
    requestOptions: {
        timeout: 10000
    },
    websocketOptions: {
        timeout: 10000
    },
});

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})


tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
        gifterNames.push(data.uniqueId)
    }
    
})

// Define the events that you want to handle
// In this case we listen to chat messages (comments)
tiktokLiveConnection.on('chat', data => {
    for(let i = 0; i< gifterNames.length; i++){
        if(data.uniqueId === gifterNames[i]){
            console.log(data.uniqueId + ': ' + data.comment)
            gifterNames.splice(i,1);
        }
    }
    // console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

// And here we receive gifts sent to the streamer
// tiktokLiveConnection.on('gift', data => {
//     // console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
//     gifterNames.push(data.uniqueId)
//     console.log(giterNames)
// })


/*
    app.get('/Search', async (req, res) => {
        try {
            
            return res.status(200).json();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
});
*/              
/*
    app.listen(PORT || 3000, () => {
        console.log(`Server is running on port 3000`);
    });
*/