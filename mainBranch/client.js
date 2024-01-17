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

// SOUND PLAYER FUNCS
var audioDeque = new Deque();

// I don't know why, but I need it , it makes sound better without using it:)
let crossFade = 10;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});
// end of non-understandable part

function initSoundPlayer() {
    let audioCtx;
    let buffer;
    function prepareSoundPlayer() {
        audioCtx = new AudioContext();
        let channels = 1;

        const frameCount = 8192 * 100;

        buffer = new AudioBuffer({
            numberOfChannels: channels,
            length: frameCount,
            sampleRate: 8192,
        });
    }

    let readyAmt = 0;
    let LastBufferIndex = 0;

    async function waitForAudio() { // we do not need such timeouts, later may make them larger
        if (audioDeque.length != 0) {
            let toAdd = audioDeque.shift();
            const nowBuffering = buffer.getChannelData(0);
            console.log(toAdd);
            if (mySound.has(toAdd[2]) && NOT_TESTING) {
                let toDecrim = mySound.get(toAdd[2]);
                for (let i = 0; i < toAdd[0].length; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][i] - toDecrim[i];
                }
            } else {
                for (let i = 0; i < toAdd[0].length; i++) {
                    nowBuffering[i + LastBufferIndex] = toAdd[0][i];
                }
            }
    
            LastBufferIndex += toAdd[0].length;
    
            readyAmt += 1
    
            if (readyAmt == 5) {
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);
                source.start();
            }
            setTimeout(() => waitForAudio(), 50);
        } else {
            setTimeout(() => waitForAudio(), 100);
        }
    }

    prepareSoundPlayer()
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
        console.log(response.getDataList(), response.getRate(), response.getSoundid());
        audioDeque.push([response.getDataList(), response.getRate(), response.getSoundid()]);
    });
}

async function sendSound(request) {
    client.sendSound(request, {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        mySound.set(response.getSoundid(), request.getDataList());

        nextRecorderBitRate = response.getRate();
        nextBitRateInd = 0;
        for (let i = startBitRate; i < nextRecorderBitRate; i*=2) {
            nextBitRateInd++;
        }
        
        if (error) {
            console.error("Error:", error);
        }
    });
}

async function sendAudioBlobDataToServer(blob, bitRate) {
    var request = new ChatClientMessage();
    request.setRate(bitRate);
    //request.setReadyToSend(true); deprecated
    request.setDataList(await serverBytesWavDataToWaveArray(blob, bitRate));
    console.log("###", request.getDataList());

    request.setUserid(userId);
    request.setConfid(confId);

    sendSound(request);
}

async function initNewClient() {
    client.initUser(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        console.log(response);
        userId = response.getUserid();

        if (error) {
            console.error("Error:", error);
        }
    });
}

async function initNewConf() {
    client.initConf(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"}, (error, response) => {
        console.log(response);
        confId = response.getConfid();
        console.log(confId);

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
    initNewClient();
    initSoundPlayer();
    getSound(document.getElementById("ConferenceId").value)
});