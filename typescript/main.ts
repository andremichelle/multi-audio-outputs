declare interface HTMLAudioElement {
    setSinkId(id: string): Promise<void>
}

const createDiv = (text: string): HTMLSpanElement => {
    const div = document.createElement('div')
    div.textContent = text
    return div
}
const createSpan = (text: string): HTMLSpanElement => {
    const span = document.createElement('span')
    span.textContent = text
    return span
}

const body = document.querySelector("body")!
body.appendChild(createDiv('v0.06'))
window.onerror = event => body.appendChild(createDiv(event.toString()))
window.onunhandledrejection = event => body.appendChild(createDiv(`${event.toString()} : ${event.reason}`))

    ;
(async () => {
    let context
    try {
        {
            body.appendChild(createDiv('Please click to create an AudioContext...'))
            context = await new Promise<AudioContext>(resolve =>
                window.addEventListener('pointerdown', () =>
                    resolve(new AudioContext()), { once: true }))
        }
        body.appendChild(createDiv(`AudioContext created.`))
        body.appendChild(createDiv(`state: ${context.state}`))
        body.appendChild(createDiv(`channelCount: ${context.destination.channelCount}`))
        body.appendChild(createDiv(`maxChannelCount: ${context.destination.maxChannelCount}`))

        {
            body.appendChild(createDiv('Please click to request user-media...'))
            await new Promise<void>(resolve => {
                window.addEventListener('pointerdown', () => {
                    body.appendChild(createDiv('waiting for user-media permission'))
                    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                        .then((stream: MediaStream) => {
                            stream.getTracks().forEach(track => track.stop()) // we do not need this stream at all
                            body.appendChild(createDiv(`got user-media permission`))
                            resolve()
                        })
                }, { once: true })
            })
        }
        {
            body.appendChild(createDiv('Now listing all media devices...'))
            const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices()
            const div = document.createElement('div')
            div.classList.add('devices')
            devices.forEach((device: MediaDeviceInfo) => {
                div.appendChild(createSpan(`label(${device.label})`))
                div.appendChild(createSpan(`kind(${device.kind})`))
                div.appendChild(createSpan(`deviceId(${device.deviceId})`))
                div.appendChild(createSpan(`groupId(${device.groupId})`))
                const input = document.createElement('input')
                input.type = "radio"
                input.name = "device"
                input.value = device.deviceId
                div.appendChild(input)
            })
            body.appendChild(div)
        }

        const audio: HTMLAudioElement = new Audio()

        const destination = context.createMediaStreamDestination()
        destination.channelCount = 4
        destination.channelCountMode = "explicit"
        destination.channelInterpretation = "discrete"

        const merger = context.createChannelMerger(4)
        merger.connect(destination)

        for (let i = 0; i < 4; i++) {
            const osc = context.createOscillator()
            osc.frequency.value = 333 * (1 << i)
            osc.connect(merger, 0, i)
            osc.start()
        }

        document.addEventListener('change', async event => {
            const input: HTMLInputElement = event.target as HTMLInputElement
            if (input.matches('input[type=radio][name=device]')) {
                input.disabled = true
                const deviceId = input.value
                body.appendChild(createDiv(`setDeviceId(${deviceId})`))
                // const result = await audio.setSinkId(deviceId)
                // body.appendChild(createDiv(`sink result: ${result}`))
                audio.srcObject = destination.stream
                await audio.play()
                body.appendChild(createDiv(`paused: ${audio.paused}`))
                body.appendChild(createDiv(`channelCount: ${destination.channelCount}`))

                input.disabled = true
            }
        })
    } catch (reason) {
        if (reason instanceof PromiseRejectionEvent) {
            body.appendChild(createDiv(`event: ${reason.reason}`))
        } else {
            body.appendChild(createDiv(`reason: ${reason}`))
        }
    }
})()