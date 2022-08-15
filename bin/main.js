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
body.appendChild(createDiv('v0.02'));
window.onerror = event => body.appendChild(createDiv(event.toString()));
window.onunhandledrejection = event => body.appendChild(createDiv(`${event.toString()} : ${event.reason}`));
(() => __awaiter(void 0, void 0, void 0, function* () {
    let context;
    try {
        body.appendChild(createDiv('please click!'));
        {
            context = yield new Promise(resolve => {
                window.addEventListener('pointerdown', () => __awaiter(void 0, void 0, void 0, function* () {
                    body.appendChild(createDiv('get user-media permission'));
                    yield navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    body.appendChild(createDiv('got user-media permission'));
                    resolve(new AudioContext());
                }), { once: true });
            });
        }
        {
            const devices = yield navigator.mediaDevices.enumerateDevices();
            const div = document.createElement('div');
            div.classList.add('devices');
            devices.forEach((device) => {
                div.appendChild(createSpan(device.label));
                div.appendChild(createSpan(device.kind));
                div.appendChild(createSpan(device.deviceId));
                div.appendChild(createSpan(device.groupId));
                const input = document.createElement('input');
                input.type = "radio";
                input.name = "device";
                input.value = device.deviceId;
                div.appendChild(input);
            });
            body.appendChild(div);
        }
        const audio = new Audio();
        const destination = context.createMediaStreamDestination();
        destination.channelCount = 4;
        destination.channelCountMode = "explicit";
        destination.channelInterpretation = "discrete";
        const merger = context.createChannelMerger(4);
        merger.connect(destination);
        for (let i = 0; i < 4; i++) {
            const osc = context.createOscillator();
            osc.frequency.value = 333 * (1 << i);
            osc.connect(merger, 0, i);
            osc.start();
        }
        document.addEventListener('change', (event) => __awaiter(void 0, void 0, void 0, function* () {
            const input = event.target;
            if (input.matches('input[type=radio][name=device]')) {
                const deviceId = input.value;
                body.appendChild(createDiv(`setSinkId(${deviceId})`));
                input.disabled = true;
                const result = yield audio.setSinkId(deviceId);
                body.appendChild(createDiv(`sink result: ${result}`));
                audio.srcObject = destination.stream;
                yield audio.play();
                body.appendChild(createDiv(`channelCount: ${destination.channelCount}`));
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