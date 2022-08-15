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
window.onerror = event => body.appendChild(createDiv(event.toString()))
window.onunhandledrejection = event => body.appendChild(createDiv(event.toString()))

    ;
(async () => {
    let context
    try {
        body.appendChild(createDiv('please click'))
        {
            context = await new Promise<AudioContext>(resolve => {
                window.addEventListener('click', async () => {
                    body.appendChild(createDiv('get user-media permission'))
                    await navigator.mediaDevices.getUserMedia({ audio: true })
                    body.appendChild(createDiv('got user-media permission'))
                    resolve(new AudioContext())
                }, { once: true })
            })
        }
        {
            const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices()
            const div = document.createElement('div')
            div.classList.add('devices')
            devices.forEach((device: MediaDeviceInfo) => {
                div.appendChild(createSpan(device.label))
                div.appendChild(createSpan(device.kind))
                div.appendChild(createSpan(device.deviceId))
                div.appendChild(createSpan(device.groupId))
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
                const deviceId = input.value
                body.appendChild(createDiv(`setSinkId(${deviceId})`))
                input.disabled = true
                const result = await audio.setSinkId(deviceId)
                body.appendChild(createDiv(`sink result: ${result}`))
                audio.srcObject = destination.stream
                await audio.play()
                body.appendChild(createDiv(`channelCount: ${destination.channelCount}`))
                input.disabled = true
            }
        })
    } catch (reason) {
        body.appendChild(createDiv(`${reason}`))
    }
})()