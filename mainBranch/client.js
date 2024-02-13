const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');
var Deque = require("collections/deque.js");

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const { ChatServerMessage, ChatClientMessage, ClientResponseMessage, ClientInfoMessage, ClientUserInitResponseMessage, ClientConfInitResponseMessage, EmptyMessage } = require('./proto/proto_pb.js');
const { SoundServiceClient } = require('./proto/proto_grpc_web_pb.js');

var client = new SoundServiceClient('http://0.0.0.0:8085');
var NOT_TESTING = false;
var DEEBUGGING_SET_CONF_ID_FIXED = true

// SOUND PLAYER FUNCS
var audioDeque = new Deque(); // each element is [data, bitRate, soundId] (soundId to understand if it client sound or someone else)

// I don't know why, but I need it , it makes sound better without using it:)
let crossFade = 10;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});
// end of non-understandable part







let TO_RECORD = false;

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
    let soundLen = 20; // in seconds
    let safeLen = 1;
    let lastsr = -100;

    //let audioCtxs = [[], []];
    let buffers = [null, null, null, null, null];
    let nowPlayingInd = 0;
    let nowWritingInd = 0;

    let audioCtxs = [new AudioContext(), new AudioContext()];
    let sources = [audioCtxs[0].createBufferSource(), audioCtxs[1].createBufferSource()];
    let playingRates = [4096 * 2, 4096 * 2, 4096 * 2, 4096 * 2, 4096 * 2];
    sources[0].connect(audioCtxs[0].destination);

    buffers[0] = prepareSoundPlayer(4096 * 2);

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

    async function startPlayingAndPrepareNext(nextPlayingInd) {
        sources[nextPlayingInd^1].start();
        audioCtxs[nextPlayingInd] = new AudioContext();
        sources[nextPlayingInd] = audioCtxs[nextPlayingInd].createBufferSource();
        setTimeout(() => startPlayingAndPrepareNext(nextPlayingInd^1), soundLen * 1000);

        sources[nextPlayingInd].connect(audioCtxs[nextPlayingInd].destination);
        nowPlayingInd = (nowPlayingInd + 1) % buffers.length;
        if (buffers[nowPlayingInd] == null) {
            buffers[nowPlayingInd] = prepareSoundPlayer(4096 * 2);
        }
        sources[nextPlayingInd].buffer = buffers[nowPlayingInd];

        buffers[(nowPlayingInd - 2 + buffers.length) % buffers.length] = null;
    } 

    async function waitForAudio() { // we do not need such timeouts, later may make them larger
    
        if (audioDeque.length != 0) {
            let toAdd = audioDeque.shift();
            let bitRateInd = getBitRateInd(toAdd[1]);

            const nowBuffering = buffers[nowWritingInd].getChannelData(0);
            if (mySound.has(toAdd[2]) && NOT_TESTING) {
                let toDecrim = mySound.get(toAdd[2]);
                for (let i = 0; i < toAdd[0].length; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][i] - toDecrim[i];
                }
            } else {
                if (lastsr != -100) {
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
                }

                lastsr = 0;
                for (let i = 0; i < 100; i++) {
                    lastsr += (toAdd[0][toAdd[0].length - 1 - i] * (100 - i) / 100.0) / 100.0;
                }
            }
    
            LastBufferIndex += toAdd[0].length;
            if (LastBufferIndex >= soundLen * playingRates[nowWritingInd]) {
                if (TO_RECORD) {
                    console.log("Care, only recording to file");
                      saveFloat32ArrayAsText(nowBuffering, 'data.txt');
                }

                LastBufferIndex = 0;
                nowWritingInd = (nowWritingInd + 1) % buffers.length;
                if (buffers[nowWritingInd] == null) {
                    buffers[nowWritingInd] = prepareSoundPlayer(4096 * 2);
                }
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

async function serverBytesWavDataToWaveArray(serverData, bitRate) {
    let blobData =  new Blob(serverData, { type: "audio/wav" });
    let arrayBuf = await blobData.arrayBuffer();
    let audioCtx = new AudioContext({sampleRate: bitRate});
    let decodedData = await audioCtx.decodeAudioData(arrayBuf);

    return decodedData.getChannelData(0); 
}

async function getSound(confId, userId) {
    var msg = new ClientInfoMessage();
    msg.setConfid(confId);
    msg.setUserid(userId);

    var stream = client.getSound(msg, {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
        //(response.getDataList(), response.getRate(), response.getSoundid());
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
        mySound.set(response.getSoundid(), request.getDataList());

        nextRecorderBitRate = response.getRate();
        nextBitRateInd = getBitRateInd(nextRecorderBitRate);
        
        if (error) {
            console.error("Error:", error);
        }
    });
}

let TO_SEND = []; // TODO change variable name
let GRAIN_SERVER_DURATION = 256; // TODO GET THAT PARAM FROM SERVER!!!!!!!!!!! // in ms

async function sendAudioBlobDataToServer(blob, bitRate) {
    TO_SEND.push(...(await serverBytesWavDataToWaveArray(blob, bitRate)));

    let step = (GRAIN_SERVER_DURATION * bitRate) / 1024; // / 1024 because sd in ms but we don't really need seconds
    let lastRightIndex = 0;
    for (let i = step; i <= TO_SEND.length; i += step) {
        async function sendRequest(dataToSend) {
            var request = new ChatClientMessage();
            request.setRate(bitRate);
            request.setDataList(dataToSend);
            request.setUserid(userId);
            request.setConfid(confId);
            request.setTimestamp(Date.now());
            request.setMessageind(i / step - 1);

            //for (let j = 0; j < 100; j++) { // remove it !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sendSound(request);
            //}
        }

        sendRequest(TO_SEND.slice(i - step, i));
        lastRightIndex = i;
    }
    TO_SEND = TO_SEND.slice(lastRightIndex, TO_SEND.length);
}

async function initNewClient(confId) {
    client.initUser(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        userId = response.getUserid();

        if (error) {
            console.error("Error:", error);
            return
        }
        getSound(confId, userId)
    });
}

async function initNewConf() {
    client.initConf(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        confId = response.getConfid();

        if (error) {
            console.error("Error:", error);
        }
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

$("#StartConferenceButton").click(() => {
    initNewConf();
});

$("#ConnectToConferenceButton").click(() => {
    if (DEEBUGGING_SET_CONF_ID_FIXED) {
        if (confId == 0) {
            console.log("Conference id is 0 now");
        }
        initNewClient(confId);
    } else {
        initNewClient(document.getElementById("ConferenceId").value);
    }
    initSoundPlayer();
});