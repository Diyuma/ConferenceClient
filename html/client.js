const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');
var Deque = require("collections/deque.js");

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const { ChatServerMessage, ChatClientMessage, ClientResponseMessage, ClientInfoMessage, ClientUserInitResponseMessage, ClientConfInitResponseMessage, EmptyMessage } = require('../proto/proto_pb.js');
const { SoundServiceClient } = require('../proto/proto_grpc_web_pb.js');

const NOT_TESTING = false;
const DEEBUGGING_SET_CONF_ID_FIXED = false;
const TO_RECORD = false;

var client = new SoundServiceClient('https://diyumaconference.ru/'); // https://diyumaconference.ru/   http://178.154.202.56:8085

// SOUND PLAYER FUNCS
var audioDeque = new Deque(); // each element is [data, bitRate, soundId] (soundId to understand if it client sound or someone else)

// I don't know why, but I need it , it makes sound better without using it:)
let crossFade = 10;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});
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
    let soundLen = 5; // in seconds
    let safeLen = 1;
    let lastsr = -100;

    //let audioCtxs = [[], []];
    let buffers = [null, null, null, null, null, null, null, null, null, null];
    let nowPlayingInd = 0;
    let nowWritingInd = 0;

    let audioCtxs = [new AudioContext(), new AudioContext()];
    let sources = [audioCtxs[0].createBufferSource(), audioCtxs[1].createBufferSource()];
    let playingRates = [nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate, nextRecorderBitRate];

    sources[0].connect(audioCtxs[0].destination);

    buffers[0] = prepareSoundPlayer(nextRecorderBitRate);

    sources[0].buffer = buffers[0];

    function prepareSoundPlayer(bitRate) {
        let channels = 1;

        const frameCount = bitRate * (soundLen + safeLen);

        let buffer = new AudioBuffer({
            numberOfChannels: channels,
            length: frameCount,
            sampleRate: bitRate,
        });

        return buffer;
    }

    async function startPlayingAndPrepareNext(nextPlayingInd) { // какой-то мега баг - playing ind то ли по модулю 2 то ли 10 (len(buffers))
        sources[(nextPlayingInd + 1) % 2].start();
        audioCtxs[nextPlayingInd] = new AudioContext();
        sources[nextPlayingInd] = audioCtxs[nextPlayingInd].createBufferSource();
        
        let toSleep = 1;
        if (nowPlayingInd )
        setTimeout(() => startPlayingAndPrepareNext((nextPlayingInd + 1) % 2), (soundLen + toSleep) * 1000);

        sources[nextPlayingInd].connect(audioCtxs[nextPlayingInd].destination);
        nowPlayingInd = (nowPlayingInd + 1) % buffers.length;
        if (buffers[nowPlayingInd] == null) {
            buffers[nowPlayingInd] = prepareSoundPlayer(nextRecorderBitRate);
        }
        sources[nextPlayingInd].buffer = buffers[nowPlayingInd];

        buffers[(nowPlayingInd - 3 + buffers.length) % buffers.length] = null;
    }

    function getSoundIndInCurBR(ind, frBR, toBR) {
        if (frBR >= toBR) {
            return ind * frBR / toBR;
        }
        let k = toBR / frBR;
        return (ind - (ind % k)) / k;
    }

    async function waitForAudio() { // we do not need such timeouts, later may make them larger
    
        if (audioDeque.length != 0) {
            console.log("****************", nowPlayingInd, nowWritingInd);
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

            if (mySound.has(toAdd[2]) && NOT_TESTING) {
                let toDecrim = mySound.get(toAdd[2]);
                let toDecrimBR = mySoundBR.get(toAdd[2]);

                for (let i = 0; i < toAddLength; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][getSoundIndInCurBR(i, toAddBR, playingRates[nowWritingInd])] - toDecrim[getSoundIndInCurBR(i, toDecrimBR, playingRates[nowWritingInd])];
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
                for (let i = 0; i < toAddLength; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][getSoundIndInCurBR(i, toAddBR, playingRates[nowWritingInd])];
                }
                

                /*lastsr = 0;
                for (let i = 0; i < 100; i++) {
                    lastsr += (toAdd[0][toAdd[0].length - 1 - i] * (100 - i) / 100.0) / 100.0;
                }*/  // TODO return later - makes sound better connect
            }
    
            LastBufferIndex += toAddLength;
            if (LastBufferIndex >= soundLen * playingRates[nowWritingInd]) {
                if (TO_RECORD) {
                    console.log("Care, only recording to file");
                      saveFloat32ArrayAsText(nowBuffering, 'data.txt');
                }

                LastBufferIndex = 0;
                nowWritingInd = (nowWritingInd + 1) % buffers.length;
                if (buffers[nowWritingInd] == null) {
                    buffers[nowWritingInd] = prepareSoundPlayer(nextRecorderBitRate); // TODO it's good idea to just use same bitrate as recorder, isn't it?
                }
                playingRates[nowWritingInd] = nextRecorderBitRate;
            }
    
            readyAmt += 1;

            if (readyAmt == 5) { // 4 not 5 because first floats will be 0
                if (!TO_RECORD) {
                    startPlayingAndPrepareNext(1);
                }
                //const source = audioCtx.createBufferSource();
                //source.connect(audioCtx.destination);

                    /*buffers[nowPlayingInd^1][1] = prepareSoundPlayer(4096 * 2);
                    audioCtxs[nowPlayingInd^1] = new AudioContext();

                    sources[nowPlayingInd^1] = audioCtxs[nowPlayingInd^1].createBufferSource();

                    sources[nowPlayingInd^1].connect(audioCtxs[nowPlayingInd^1].destination);
                    sources[nowPlayingInd^1].buffer = buffers[nowPlayingInd^1][1];*/
            }
            /*if (readyAmt > 4 && readyAmt % 20 == 5 || readyAmt % 20 == 0) { // 4 not 5 because first floats will be 0
                let ind = 0;
                
                //const source = audioCtx.createBufferSource();
                //source.connect(audioCtx.destination);
                if (readyAmt % 20 == 5) {
                    sources[nowPlayingInd].start();




                    buffers[nowPlayingInd^1][1] = prepareSoundPlayer(4096 * 2);
                    audioCtxs[nowPlayingInd^1] = new AudioContext();

                    sources[nowPlayingInd^1] = audioCtxs[nowPlayingInd^1].createBufferSource();

                    sources[nowPlayingInd^1].connect(audioCtxs[nowPlayingInd^1].destination);
                    sources[nowPlayingInd^1].buffer = buffers[nowPlayingInd^1][1];
                } else {
                    LastBufferIndex = 0;
                    nowPlayingInd ^= 1;

                    buffers[nowPlayingInd][1] = prepareSoundPlayer(4096 * 2);
                    audioCtxs[nowPlayingInd] = new AudioContext();

                    sources[nowPlayingInd] = audioCtxs[nowPlayingInd].createBufferSource();

                    sources[nowPlayingInd].connect(audioCtxs[nowPlayingInd].destination);
                    sources[nowPlayingInd].buffer = buffers[nowPlayingInd][1];

                    //sources[nowPlayingInd].start();
                }
                /*for (let i = startBitRate; i <= maxBitRate; i *= 2) {
                    /*[audioCtxs[nowPlayingInd][ind], buffers[nowPlayingInd][ind]] = prepareSoundPlayer(i);
                    const source = audioCtxs[nowPlayingInd][ind].createBufferSource();
                    source.buffer = buffers[nowPlayingInd][ind];
                    source.connect(audioCtxs[nowPlayingInd][ind].destination);
                    source.start();

                    ind++;
                }* /
            }*/
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

    var stream = client.getSound(msg, {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
        //(response.getDataList(), response.getRate(), response.getSoundid());
        console.log(response);
        audioDeque.push([response.getDataList(), response.getRate(), response.getSoundid()]);
    });
}

function getBitRateInd(bitRate) {
    var ind = 0;
    for (let i = startBitRate; i < bitRate; i *= 2) {
        ind++;
    }
    return ind;
}

async function sendSound(request) {
    client.sendSound(request, {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return;
        }
        mySound.set(response.getSoundid(), request.getDataList());
        mySoundBR.set(response.getSoundid(), request.getRate());

        nextRecorderBitRate = response.getRate();
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

    let step = (GRAIN_SERVER_DURATION * bitRate) / 1024; // / 1024 because sd in ms but we don't really need seconds
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
            console.log("send", dataId);

            sendSound(request);
        }

        console.log("func", SendMessageIndex);
        sendRequest(TO_SEND.slice(i - step, i), (i / step) - 1); // CHANGE TODO!!!!!!! (i / step) - 1 -> iSendMessageIndex
        SendMessageIndex += 1;
        lastRightIndex = i;
    }
    TO_SEND = TO_SEND.slice(lastRightIndex, TO_SEND.length);
}

async function initNewClient(confId) {
    client.initUser(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return
        }
        userId = response.getUserid();
        getSound(confId, userId)
    });
}

async function initNewConf() {
    client.initConf(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        if (error) {
            console.error("Error:", error);
            return;
        }
        confId = response.getConfid();
        createClient();
    });
}



let soundDuration = 500; // 250 - minimum 500 - ok баланс между зарежкой и качеством

//RECORDER FUNCS
var curRecorderBitRate = 8192;
var curBitRateInd = 1;
var nextRecorderBitRate = 8192;
var nextBitRateInd = 1;
var startBitRate = 4096;
var maxBitRate = 32768;
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

            isRecorderStopped[chunkInd] = false;
            isRecorderStopped[chunkInd^1] = true;

            recorderState[recorderStateInd^1] = [chunkInd, nextRecorderBitRate];
            
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

    const confIdText = document.createTextNode("Your conference id is:" + ConferenceId.toString());
    document.body.appendChild(confIdText);
}

function createClient() {
    if (DEEBUGGING_SET_CONF_ID_FIXED) {
        if (confId == 0) {
            console.log("Conference id is 0 now");
        }
        initNewClient(confId);
    } else {
        if (confId == null) {
            confId = document.getElementById("ConferenceId").value;
        }
        initNewClient(confId);
    }
    
    changeConnectionToConferenceElems(confId);
    initSoundPlayer();
}

$("#StartConferenceButton").click(() => {
    initNewConf();
});

$("#ConnectToConferenceButton").click(() => {
    createClient();
});