const audio_context = new AudioContext()

const gainNode = audio_context.createGain()
gainNode.gain.setValueAtTime(0.05, 0)
gainNode.connect(audio_context.destination)

const play_btn = document.getElementById('play')  // document.querySelector('.play')
const stop_btn = document.getElementById('stop')  // document.querySelector('.stop')

const duration = document.getElementById('duration')
const dur = document.getElementById('dur')

duration.addEventListener('input', () => {
    dur.innerHTML = duration.value
})

let osci

play_btn.addEventListener('click', () => {
    osci = audio_context.createOscillator()
    osci.frequency.setValueAtTime(Number(document.getElementById('frequency').value), 0)
    osci.type = document.getElementById('type').value
    osci.connect(gainNode)
    osci.start()
    osci.stop(audio_context.currentTime + Number(duration.value)/1000)
})

stop_btn.addEventListener('click', () => {
    osci.stop()
})