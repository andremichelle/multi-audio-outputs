"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createDiv = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div;
};
const createSpan = (text) => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
};
const body = document.querySelector("body");
body.appendChild(createDiv('v0.07'));
window.onerror = event => body.appendChild(createDiv(event.toString()));
window.onunhandledrejection = event => body.appendChild(createDiv(`${event.toString()} : ${event.reason}`));
const createScene = (context) => {
    const merger = context.createChannelMerger(4);
    for (let i = 0; i < 4; i++) {
        const osc = context.createOscillator();
        osc.frequency.value = 333 * (1 << i);
        osc.connect(merger, 0, i);
        osc.start();
    }
    return merger;
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    let context;
    try {
        {
            body.appendChild(createDiv('Please click to create an AudioContext...'));
            context = yield new Promise(resolve => window.addEventListener('pointerdown', () => resolve(new AudioContext()), { once: true }));
        }
        body.appendChild(createDiv(`AudioContext created.`));
        body.appendChild(createDiv(`state: ${context.state}`));
        const destination = context.destination;
        destination.channelCount = Math.min(4, destination.maxChannelCount);
        destination.channelCountMode = 'explicit';
        destination.channelInterpretation = 'discrete';
        body.appendChild(createDiv(`channelCount: ${destination.channelCount}`));
        body.appendChild(createDiv(`maxChannelCount: ${destination.maxChannelCount}`));
        if (destination.channelCount === 4) {
            body.appendChild(createDiv(`connect...`));
            createScene(context).connect(destination);
            return;
        }
        {
            body.appendChild(createDiv('Please click to request user-media...'));
            yield new Promise(resolve => {
                window.addEventListener('pointerdown', () => {
                    body.appendChild(createDiv('waiting for user-media permission'));
                    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                        .then((stream) => {
                        stream.getTracks().forEach(track => track.stop());
                        body.appendChild(createDiv(`got user-media permission`));
                        resolve();
                    });
                }, { once: true });
            });
        }
        {
            body.appendChild(createDiv('Now listing all media devices...'));
            const devices = yield navigator.mediaDevices.enumerateDevices();
            const div = document.createElement('div');
            div.classList.add('devices');
            devices.forEach((device) => {
                div.appendChild(createSpan(`label(${device.label})`));
                div.appendChild(createSpan(`kind(${device.kind})`));
                div.appendChild(createSpan(`deviceId(${device.deviceId})`));
                div.appendChild(createSpan(`groupId(${device.groupId})`));
                const input = document.createElement('input');
                input.type = "radio";
                input.name = "device";
                input.value = device.deviceId;
                div.appendChild(input);
            });
            body.appendChild(div);
        }
        const audio = new Audio();
        const streamDestination = context.createMediaStreamDestination();
        streamDestination.channelCount = 4;
        streamDestination.channelCountMode = "explicit";
        streamDestination.channelInterpretation = "discrete";
        createScene(context).connect(streamDestination);
        document.addEventListener('change', (event) => __awaiter(void 0, void 0, void 0, function* () {
            const input = event.target;
            if (input.matches('input[type=radio][name=device]')) {
                input.disabled = true;
                const deviceId = input.value;
                body.appendChild(createDiv(`setDeviceId(${deviceId})`));
                audio.srcObject = streamDestination.stream;
                yield audio.play();
                body.appendChild(createDiv(`paused: ${audio.paused}`));
                body.appendChild(createDiv(`channelCount: ${streamDestination.channelCount}`));
                input.disabled = true;
            }
        }));
    }
    catch (reason) {
        if (reason instanceof PromiseRejectionEvent) {
            body.appendChild(createDiv(`event: ${reason.reason}`));
        }
        else {
            body.appendChild(createDiv(`reason: ${reason}`));
        }
    }
}))();
//# sourceMappingURL=main.js.map