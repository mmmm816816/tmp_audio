// www.youtube.com/watch?v=laCjGMhASp8
const audio_context = new AudioContext()

const buffer = audio_context.createBuffer(
    1,
    audio_context.sampleRate * 1,
    audio_context.sampleRate
)

const channel_data = buffer.getChannelData(0)
// console.log(channel_data.length) // 48000

for (let i = 0; i < buffer.length; i++) {
    channel_data[i] = Math.random() * 2 - 1
}

const primary_gain_control = audio_context.createGain()
primary_gain_control.gain.setValueAtTime(0.05, 0)
primary_gain_control.connect(audio_context.destination)



// Triangle
const triangle_button = document.createElement('button')
triangle_button.innerHTML = "Triangle"
triangle_button.addEventListener('click', () => {
    const kick_oscillator = audio_context.createOscillator()
    kick_oscillator.frequency.setValueAtTime(440, 0)
    kick_oscillator.type = 'triangle'
    kick_oscillator.connect(primary_gain_control)
    kick_oscillator.start()
    kick_oscillator.stop(audio_context.currentTime + 3)
    console.log(kick_oscillator)
})
document.body.appendChild(triangle_button)
