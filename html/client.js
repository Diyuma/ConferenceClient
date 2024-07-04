const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');
var Deque = require("collections/deque.js");

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const { ChatServerMessage, ChatClientMessage, ClientResponseMessage, ClientInfoMessage, ClientUserInitResponseMessage, ClientConfInitResponseMessage, EmptyMessage } = require('../proto/proto_pb.js');
const { SoundServiceClient } = require('../proto/proto_grpc_web_pb.js');

const NOT_TESTING = true;
const DEEBUGGING_SET_CONF_ID_FIXED = false;
const TO_RECORD = false;

var soundClient = new SoundServiceClient('http://127.0.0.1:443'); // http://127.0.0.1:443 https://diyumaconference.ru/

// SOUND PLAYER FUNCS
var audioDeque = new Deque(); // each element is [data, bitRate, soundId] (soundId to understand if it client sound or someone else)

// I don't know why, but I need it , it makes sound better without using it:)
//let crossFade = 10;
//const { Gapless5 } = require('@regosen/gapless-5');
//const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});
// end of non-understandable part





function saveFloat32ArrayAsText(float32Array, filename) {
    const textArray = Array.from(float32Array, value => value.toString());
  
    const textContent = textArray.join('\n');
  
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename || 'data.txt';
  
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}





function initSoundPlayer() {
    let readyAmt = 0;
    let LastBufferIndex = 0;
    let lastWaveValues = [];
    let SOUND_LEN = 5; // in seconds
    let SAFE_ZONE_SZ = 2;
    //let safeLen = 1;
    let lastsr = -100;

    //let audioCtxs = [[], []];
    let buffers = [];
    let playingRates = [];
    createNewBuffer(0);
    createNewBuffer(1);

    let nowPlayingInd = -1;
    let nowWritingInd = 0;

    let audioCtxs = [new AudioContext()];
    let sources = [];

    function prepareSoundPlayer(bitRate) {
        let channels = 1;

        const frameCount = bitRate * SOUND_LEN;

        let buffer = new AudioBuffer({
            numberOfChannels: channels,
            length: frameCount,
            sampleRate: bitRate,
        });

        return buffer;
    }

    function clientIsTooFastPlaying(nextPlayingInd) {
        console.log("Client is too fast playing"); 
        /*if (nextRecorderBitRate > startBitRate) { dangerous becuase of async
            nextRecorderBitRate /= 2;
            nextBitRateInd -= 1;
        }*/
        pingServer();
        nowPlayingInd = nextPlayingInd - 2;
        readyAmt = 0; // to make client wait next x server records
        SAFE_ZONE_SZ++;
    }

    async function startPlayingAndPrepareNext(nextPlayingInd) {
        sources[nextPlayingInd - 1].start();
        
        let toSleep = 1;

        if (nextPlayingInd > nowWritingInd + 1) {
            clientIsTooFastPlaying(nextPlayingInd);
            return;
        }

        nowPlayingInd = nextPlayingInd - 1;
        if (nextPlayingInd >= 3) {
            buffers[nextPlayingInd - 3] = null; // TODO I believe that -2 is enough , but -3 just to be 100% sure
        }
        setTimeout(() => startPlayingAndPrepareNext(nextPlayingInd + 1), SOUND_LEN * 1000);

        audioCtxs[nextPlayingInd] = new AudioContext();
        sources[nextPlayingInd] = audioCtxs[nextPlayingInd].createBufferSource();
        sources[nextPlayingInd].connect(audioCtxs[nextPlayingInd].destination);
        sources[nextPlayingInd].buffer = buffers[nextPlayingInd];
    }

    function getSoundIndInCurBR(ind, frBR, toBR) {
        if (frBR >= toBR) {
            return ind * frBR / toBR;
        }
        let k = toBR / frBR;
        return (ind - (ind % k)) / k;
    }

    function SetDataToBuffer(li, amt, toAdd, toAddBR, buf, onlyOne) {
        if (mySound.has(toAdd[2]) && NOT_TESTING) {
            if (onlyOne) {
                return;
            }
            let toDecrim = mySound.get(toAdd[2]);
            let toDecrimBR = mySoundBR.get(toAdd[2]);

            for (let i = li; i < li + amt; i++) {
                buf[i - li + LastBufferIndex] = toAdd[0][getSoundIndInCurBR(i, toAddBR, playingRates[nowWritingInd])] - toDecrim[getSoundIndInCurBR(i, toDecrimBR, playingRates[nowWritingInd])];
            }
        } else {
            /*if (lastsr != -100) {
                for (let i = 0; i < 100; i++) {
                    //nowBuffering[i + LastBufferIndex] = (lastsr * (100 - i) / 100.0 + toAdd[0][i] * (i + 1) / 100);
                    nowBuffering[i + LastBufferIndex] = (lastsr * (100 - i) / 100.0 + toAdd[0][i])  / 2.0;
                }

                for (let i = 100; i < toAdd[0].length; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][i];
                }
            } else {
                for (let i = 0; i < toAdd[0].length; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][i];
                }
            }*/ // TODO return later - makes sound better connect
            for (let i = li; i < li + amt; i++) {
                buf[i - li + LastBufferIndex] = toAdd[0][getSoundIndInCurBR(i, toAddBR, playingRates[nowWritingInd])];
            }
            

            /*lastsr = 0;
            for (let i = 0; i < 100; i++) {
                lastsr += (toAdd[0][toAdd[0].length - 1 - i] * (100 - i) / 100.0) / 100.0;
            }*/  // TODO return later - makes sound better connect
        }
    }

    function createNewBuffer(ind) {
        buffers[ind] = prepareSoundPlayer(nextRecorderBitRate); // TODO it's good idea to just use same bitrate as recorder, isn't it?
        playingRates[ind] = nextRecorderBitRate;
    }

    async function waitForAudio() { // we do not need such timeouts, later may make them larger
    
        if (audioDeque.length != 0) {
            let toAdd = audioDeque.shift();
            let toAddBR = toAdd[1];
            let bitRateInd = getBitRateInd(toAddBR);

            const nowBuffering = buffers[nowWritingInd].getChannelData(0);
            let toAddLength = toAdd[0].length;
            if (playingRates[nowWritingInd] > toAddBR) {
                toAddLength *= playingRates[nowWritingInd] / toAddBR;
            } else if (playingRates[nowWritingInd] < toAddBR) {
                toAddLength /= toAddBR / playingRates[nowWritingInd];
            }

            var lastInd = 0;
            while (lastInd < toAddLength) {
                var amt = Math.min(toAddLength, SOUND_LEN * playingRates[nowWritingInd] - LastBufferIndex);
                SetDataToBuffer(lastInd, amt, toAdd, toAddBR, nowBuffering, !toAdd[4]);
                lastInd += amt;
                LastBufferIndex += amt;

                if (LastBufferIndex >= SOUND_LEN * playingRates[nowWritingInd]) {
                    if (TO_RECORD) {
                        console.log("Care, only recording to file");
                        saveFloat32ArrayAsText(nowBuffering, 'data.txt');
                    }
                    
                    LastBufferIndex = 0;
                    nowWritingInd += 1;
                    createNewBuffer(nowWritingInd + 1); // create next buffer
                }
            }
    
            readyAmt += 1;

            if (readyAmt == SAFE_ZONE_SZ) {
                if (!TO_RECORD) {
                    audioCtxs[nowPlayingInd + 1] = new AudioContext();
                    sources[nowPlayingInd + 1] = audioCtxs[nowPlayingInd + 1].createBufferSource();
                    sources[nowPlayingInd + 1].connect(audioCtxs[nowPlayingInd + 1].destination);
                    sources[nowPlayingInd + 1].buffer = buffers[nowPlayingInd + 1];

                    startPlayingAndPrepareNext(nowPlayingInd + 2);
                }
            }
            setTimeout(() => waitForAudio(), 50);
        } else {
            setTimeout(() => waitForAudio(), 100);
        }
    }

    /*let ind = 0;
    for (let i = startBitRate; i <= maxBitRate; i *= 2) {
        for (let j = 0; j < 2; j++) {
            buffers[j][ind] = prepareSoundPlayer(i);
        }
        ind++;
    }*/
    //console.log("*", buffers);
    waitForAudio();
}


// CLIENT-SERVER FUNCS
var userId = null, confId = null;
let mySound = new Map();
let mySoundBR = new Map();

async function serverBytesWavDataToWaveArray(serverData, bitRate) {
    let blobData =  new Blob(serverData, { type: "audio/wav" });
    let arrayBuf = await blobData.arrayBuffer();
    let audioCtx = new AudioContext({sampleRate: bitRate});
    let decodedData = await audioCtx.decodeAudioData(arrayBuf);
    /*if (decodedData == null) { do not need it - may delete and todo too
        console.log("Warn: recorder broken data"); // TODO check why it get null there
        return null;
    }*/

    return decodedData.getChannelData(0); 
}

async function getSound(confId, userId) {
    var msg = new ClientInfoMessage();
    msg.setConfid(confId);
    msg.setUserid(userId);

    var stream = soundClient.getSound(msg, {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
        audioDeque.push([response.getDataList(), response.getRate(), response.getSoundid(), response.getOnlyone()]);
    });

    /*stream.on('end', function(end) {
        getSound(confId, userId);
    });*/
}

function getBitRateInd(bitRate) {
    var ind = 0;
    for (let i = startBitRate; i < bitRate; i *= 2) {
        ind++;
    }
    return ind;
}

async function sendSound(request) {
    soundClient.sendSound(request, {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return;
        }
        mySound.set(response.getSoundid(), request.getDataList());
        mySoundBR.set(response.getSoundid(), request.getRate());

        nextRecorderBitRate = response.getRate();
        //nextRecorderBitRate = 8192; // !!!!!!!!!!!!!!!!!!!!!!!!!!! fixed recorderrate
        if (nextRecorderBitRate > maxBitRate) {
            nextRecorderBitRate = maxBitRate;
        }
        if (nextRecorderBitRate < startBitRate) {
            nextRecorderBitRate = startBitRate;
        }
        nextBitRateInd = getBitRateInd(nextRecorderBitRate);
    });
}

let TO_SEND = []; // TODO change variable name
let GRAIN_SERVER_DURATION = 256; // TODO GET THAT PARAM FROM SERVER!!!!!!!!!!! // in ms
let SendMessageIndex = 0;

async function sendAudioBlobDataToServer(blob, bitRate) {
    /*let wavArr = await serverBytesWavDataToWaveArray(blob, bitRate);
    if (wavArr != null) {
        TO_SEND.push(...(wavArr));
    }*/ //  do not need it - may delete
    TO_SEND.push(...(await serverBytesWavDataToWaveArray(blob, bitRate)));

    let step = (GRAIN_SERVER_DURATION * bitRate) / 1024; // /  1024 because sd in ms but we don't really need seconds
    let lastRightIndex = 0;
    for (let i = step; i <= TO_SEND.length; i += step) {
        async function sendRequest(dataToSend, dataId) {
            var request = new ChatClientMessage();
            request.setRate(bitRate);
            request.setDataList(dataToSend);
            request.setUserid(userId);
            request.setConfid(confId);
            request.setTimestamp(Date.now());
            request.setMessageind(dataId);

            sendSound(request);
        }

        sendRequest(TO_SEND.slice(i - step, i), (i / step) - 1); // CHANGE TODO!!!!!!! (i / step) - 1 -> iSendMessageIndex
        SendMessageIndex += 1;
        lastRightIndex = i;
    }
    TO_SEND = TO_SEND.slice(lastRightIndex, TO_SEND.length);
}

async function initNewClient(confId, isAdmin) {
    soundClient.initUser(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return
        }
        userId = response.getUserid();
        getSound(confId, userId);

        //RunVideo(confId, userId, isAdmin);
        //StartVideoSending();
        //StartVideoGetting();
    });
}

async function initNewConf() {
    soundClient.initConf(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return;
        }
        confId = response.getConfid();
        createClient(true);
    });
}

async function pingServer() {
    var msg = new ClientInfoMessage();
    msg.setConfid(confId);
    msg.setUserid(userId);
    soundClient.pingServer(msg, {"Access-Control-Allow-Origin": "*"}, (error, response) => {});
}



let soundDuration = 256; // 250 - minimum 500 - ok баланс между зарежкой и качеством // should be dividable by GRAIN_SERVER_DURATION as not to mix bitrate int TO_SEND
                         // so ater sending whole recording is should be empty

//RECORDER FUNCS
var curRecorderBitRate = 8192;
var curBitRateInd = 1;
var nextRecorderBitRate = 8192;
var nextBitRateInd = 1;
var startBitRate = 4096 * 2;
var maxBitRate = 32768 * 4;
document.getElementById("startRecording").addEventListener("click", initRecorder);
function initRecorder() {
    async function getUserMedia(constraints) {
        if (window.navigator.mediaDevices) {
            return window.navigator.mediaDevices.getUserMedia(constraints);
        }
        let legacyApi =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        if (legacyApi) {
            return new Promise(function (resolve, reject) {
                legacyApi.bind(window.navigator)(constraints, resolve, reject);
            });
        } else {
            alert("user api not supported");
        }
    }
    
    function newAudioStreamWithRate(stream, rate) {
        const audioContext = new AudioContext({ sampleRate: rate });
        const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
        const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
        mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
        return new MediaRecorder(mediaStreamAudioDestinationNode.stream, { mimeType: 'audio/wav'});
    }
  
    let recordedChunks = [[], []];
    let isRecorderStopped = [true, true];
    let HaveToStop = false;
    var recorderState = []; // array with 2 pairs (chunkInd, BitRate) not to loose recorder state info in ondatavaliable func
    var recorderStateInd = 0;

    recorderState[0] = [0, curRecorderBitRate];
    function handleMicrophoneOn(stream) {
        let recorders = [];
        for (let bitRate = startBitRate; bitRate <= maxBitRate; bitRate *= 2) {
            recorders.push([newAudioStreamWithRate(stream, bitRate), newAudioStreamWithRate(stream, bitRate)]);
        }
        
        isRecorderStopped[0] = false;

        async function runRecorder(chunkInd) {
            recorders[curBitRateInd][chunkInd].ondataavailable = e => {
                var chunkIndNow = recorderState[recorderStateInd][0];
                var bitRateNow = recorderState[recorderStateInd][1];
                recordedChunks[chunkIndNow].push(e.data);

                if (isRecorderStopped[chunkIndNow]) {
                    sendAudioBlobDataToServer(recordedChunks[chunkIndNow], bitRateNow);
                    recordedChunks[chunkIndNow] = [];

                    recorderStateInd^=1; // we believe that there won't be any data after stop
                }
            };

            if (HaveToStop) { // need to stop recording
                HaveToStop = false;
                return;
            }

            setTimeout(() => { runRecorder(chunkInd^1) }, soundDuration); // ms

            recorderState[recorderStateInd^1] = [chunkInd, nextRecorderBitRate];

            isRecorderStopped[chunkInd] = false;
            isRecorderStopped[chunkInd^1] = true;
            
            recorders[nextBitRateInd][chunkInd].start();
            recorders[curBitRateInd][chunkInd^1].stop();
            curRecorderBitRate = nextRecorderBitRate;
            curBitRateInd = nextBitRateInd;
        }
        
        SendMessageIndex = 0;
        runRecorder(0);
    }

    function startUsingMicrophone(boolean) {
        getUserMedia({ audio: boolean }).then((stream) => {
            handleMicrophoneOn(stream);
        });
    }
    startUsingMicrophone(true);

    document.getElementById("stopRecording").addEventListener("click", (e) => {
        for (let i = 0; i < 10; i++) { // just to be sure because of async recording
            isRecorderStopped[0] = true;
            isRecorderStopped[1] = true;
            HaveToStop = true;
            recorder.stop();
        }
    });
}

// TODO literally I don't want to change it, but it's not good idea
function changeConnectionToConferenceElems(ConferenceId) {
    var b1 = document.getElementById('StartConferenceButton');
    b1.style.visibility = "hidden";

    var b2 = document.getElementById('ConnectToConferenceButton');
    b2.style.visibility = "hidden";

    var l = document.getElementById('ConnectToConferenceFormLabel');
    l.style.visibility = "hidden";

    var t = document.getElementById('ConferenceText');
    t.style.visibility = "hidden";

    var f = document.getElementById('ConferenceId');
    f.style.visibility = "hidden";

    var pl = document.getElementById('startRecording');
    pl.removeAttribute("hidden");

    var st = document.getElementById('stopRecording');
    st.removeAttribute("hidden");

    var cb = document.getElementById('CopyConfIdButton');
    cb.removeAttribute("hidden");

    const confIdText = document.createTextNode("Your conference id is:" + ConferenceId.toString());
    document.body.appendChild(confIdText);
}

let got_sound_amt = 0; // to rm
let need_to_get = 1000; // to rm

function createClient(isAdmin) {
    if (DEEBUGGING_SET_CONF_ID_FIXED) {
        if (confId == 0) {
            console.log("Conference id is 0 now");
        }
        initNewClient(confId, isAdmin);
    } else {
        if (confId == null) {
            confId = document.getElementById("ConferenceId").value;
        }
        initNewClient(confId, isAdmin);
    }
    
    changeConnectionToConferenceElems(confId);
    //initSoundPlayer();
    let arr = [];
    for (let i = 0; i < 1000; i++) {
        arr[i] = i % 128;
    }
    async function sendRequest(dataToSend, dataId) {
        var request = new ChatClientMessage();
        request.setRate(1024);
        request.setDataList(dataToSend);
        request.setUserid(userId);
        request.setConfid(confId);
        request.setTimestamp(Date.now());
        request.setMessageind(dataId);

        sendSound(request);
    }
    const socket = new WebSocket("ws://127.0.0.1:443/websocket");

    socket.addEventListener("open", (event) => {
        console.log("start send", Date.now());
        // Create WebSocket connection.
        // Connection opened

        console.log("Message from server ", event.data);
        socket.addEventListener("message", (event) => {
            got_sound_amt += 1; // to rm
            if (got_sound_amt == 1000) {
                console.log("get all responses", Date.now());
            }
        });

        for (let i = 0; i < need_to_get; i++) {
            socket.send(arr);
            //sendRequest(arr, 0);
        }
        console.log("end send", Date.now());
    })
}

$("#StartConferenceButton").click(() => {
    initNewConf();
});

$("#ConnectToConferenceButton").click(() => {
    createClient(false);
});

$("#CopyConfIdButton").click(() => {
    navigator.clipboard.writeText(confId);
});
