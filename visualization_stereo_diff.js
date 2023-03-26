document.getElementById("start-btn").addEventListener("click", (e) => {
    start();
});

function start() {

    var audioCtx = new AudioContext();
    var source;
    var stream;

    var mute = document.querySelector(".mute");

    var splitter = audioCtx.createChannelSplitter(2);

    var analyserL = audioCtx.createAnalyser();
    analyserL.minDecibels = -90;
    analyserL.maxDecibels = -10;
    analyserL.smoothingTimeConstant = 0.85;
    var gainNodeL = audioCtx.createGain();

    var analyserR = audioCtx.createAnalyser();
    analyserR.minDecibels = -90;
    analyserR.maxDecibels = -10;
    analyserR.smoothingTimeConstant = 0.85;
    var gainNodeR = audioCtx.createGain();

    var merger = audioCtx.createChannelMerger(2);

    var canvasL = document.getElementById("visualizerL");
    var canvasCtxL = canvasL.getContext("2d");
    var canvasR = document.getElementById("visualizerR");
    var canvasCtxR = canvasR.getContext("2d");
    var canvasDiff = document.getElementById("diff");
    var canvasCtxDiff = canvasDiff.getContext("2d");

    var intendedWidth = document.querySelector(".wrapper").clientWidth;

    canvasL.setAttribute("width", intendedWidth);
    canvasR.setAttribute("width", intendedWidth);
    canvasDiff.setAttribute("width", intendedWidth);

    var visualSelect = document.getElementById("visual");

    var drawVisual;

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(
            {
                audio: true,
            },

            // Success callback
            function (stream) {
                source = audioCtx.createMediaStreamSource(stream);
                //console.log('numOfInputs: ' + source.numberOfInputs); // 0
                source.connect(splitter); // .connect(destination, outputIndex of input) // .connect(destination, outputIndex, inputIndex of output)
                splitter.connect(analyserL, 0);
                splitter.connect(analyserR, 1);
                analyserL.connect(gainNodeL);
                analyserR.connect(gainNodeR);
                gainNodeL.connect(merger, 0, 0);
                gainNodeR.connect(merger, 0, 1);
                merger.connect(audioCtx.destination);

                visualize();
            },

            // Error callback
            function (err) {
                console.log("The following gUM error occured: " + err);
            }
        );
    } else {
        console.log("getUserMedia not supported on your browser!");
    }

    function visualize() {
        WIDTH = canvasL.width; // eq canvasR.width
        HEIGHT = canvasL.height; // eq canvasR.height

        var visualSetting = visualSelect.value;
        console.log(visualSetting);

        if (visualSetting == "sinewave") {
            analyserL.fftSize = 1024;
            var bufferLengthL = analyserL.fftSize;
            //console.log(bufferLengthL);
            var dataArrayL = new Float32Array(bufferLengthL);
            canvasCtxL.clearRect(0, 0, WIDTH, HEIGHT);

            analyserR.fftSize = 1024;
            var bufferLengthR = analyserR.fftSize;
            var dataArrayR = new Float32Array(bufferLengthR);
            canvasCtxR.clearRect(0, 0, WIDTH, HEIGHT);

            canvasCtxDiff.clearRect(0, 0, WIDTH, HEIGHT);

            function draw() {
                drawVisual = requestAnimationFrame(draw);

                analyserL.getFloatTimeDomainData(dataArrayL);
                canvasCtxL.fillStyle = "rgb(200, 200, 200)";
                canvasCtxL.fillRect(0, 0, WIDTH, HEIGHT);
                canvasCtxL.lineWidth = 2;
                canvasCtxL.strokeStyle = "rgb(0, 0, 0)";
                canvasCtxL.beginPath();

                analyserR.getFloatTimeDomainData(dataArrayR);
                canvasCtxR.fillStyle = "rgb(200, 200, 200)";
                canvasCtxR.fillRect(0, 0, WIDTH, HEIGHT);
                canvasCtxR.lineWidth = 2;
                canvasCtxR.strokeStyle = "rgb(0, 0, 0)";
                canvasCtxR.beginPath();

                canvasCtxDiff.fillStyle = "rgb(200, 200, 200)";
                canvasCtxDiff.fillRect(0, 0, WIDTH, HEIGHT);
                canvasCtxDiff.lineWidth = 2;
                canvasCtxDiff.strokeStyle = "rgb(0, 0, 0)";
                canvasCtxDiff.beginPath();

                var sliceWidthL = (WIDTH * 1.0) / bufferLengthL;
                var sliceWidthR = (WIDTH * 1.0) / bufferLengthR;
                var xL = 0;
                var xR = 0;
                for (var i = 0; i < bufferLengthL; i++) { // assuming that bufferLengthL -eq bufferLengthR
                    var vL = dataArrayL[i] * 200.0;
                    var yL = HEIGHT / 2 + vL;
                    var vR = dataArrayR[i] * 200.0;
                    var yR = HEIGHT / 2 + vR;
                    if (i === 0) {
                        canvasCtxL.moveTo(xL, yL);
                        canvasCtxR.moveTo(xR, yR);
                        canvasCtxDiff.moveTo(xR, yL - yR);
                    } else {
                        canvasCtxL.lineTo(xL, yL);
                        canvasCtxR.lineTo(xR, yR);
                        canvasCtxDiff.lineTo(xR, yL - yR);
                    }
                    xL += sliceWidthL;
                    xR += sliceWidthR;
                }
                canvasCtxL.lineTo(canvasL.width, canvasL.height / 2);
                canvasCtxR.lineTo(canvasR.width, canvasR.height / 2);
                canvasCtxDiff.lineTo(canvasR.width, canvasR.height / 2);
                canvasCtxL.stroke();
                canvasCtxR.stroke();
                canvasCtxDiff.stroke();
            }

            draw();

        } else if (visualSetting == "frequencybars") {

            analyserL.fftSize = 256;
            var bufferLengthL = analyserL.frequencyBinCount;
            //console.log(bufferLengthL);
            var dataArrayL = new Float32Array(bufferLengthL);
            canvasCtxL.clearRect(0, 0, WIDTH, HEIGHT);

            analyserR.fftSize = 256;
            var bufferLengthR = analyserR.frequencyBinCount;
            var dataArrayR = new Float32Array(bufferLengthR);
            canvasCtxR.clearRect(0, 0, WIDTH, HEIGHT);

            canvasCtxDiff.clearRect(0, 0, WIDTH, HEIGHT);

            function draw() {
                drawVisual = requestAnimationFrame(draw);

                analyserL.getFloatFrequencyData(dataArrayL);
                canvasCtxL.fillStyle = "rgb(0, 0, 0)";
                canvasCtxL.fillRect(0, 0, WIDTH, HEIGHT);
                var barWidthL = (WIDTH / bufferLengthL) * 2.5;
                var barHeightL;
                var xL = 0;

                analyserR.getFloatFrequencyData(dataArrayR);
                canvasCtxR.fillStyle = "rgb(0, 0, 0)";
                canvasCtxR.fillRect(0, 0, WIDTH, HEIGHT);
                var barWidthR = (WIDTH / bufferLengthR) * 2.5;
                var barHeightR;
                var xR = 0;

                canvasCtxDiff.fillStyle = "rgb(0, 0, 0)";
                canvasCtxDiff.fillRect(0, 0, WIDTH, HEIGHT);

                for (var i = 0; i < bufferLengthL; i++) {
                    barHeightL = (dataArrayL[i] + 140) * 2;
                    barHeightR = (dataArrayR[i] + 140) * 2;
                    canvasCtxL.fillStyle =
                        "rgb(" + Math.floor(barHeightL + 100) + ",50,50)";
                    canvasCtxR.fillStyle =
                        "rgb(" + Math.floor(barHeightR + 100) + ",50,50)";
                    canvasCtxDiff.fillStyle =
                        "rgb(" + Math.floor(barHeightR + 100) + ",50,50)";
                    canvasCtxL.fillRect(
                        xL,
                        HEIGHT - barHeightL / 2,
                        barWidthL,
                        barHeightL / 2
                    );
                    canvasCtxR.fillRect(
                        xR,
                        HEIGHT - barHeightR / 2,
                        barWidthR,
                        barHeightR / 2
                    );
                    canvasCtxDiff.fillRect(
                        xR,
                        HEIGHT - barHeightR / 2,
                        barWidthR,
                        barHeightL / 2 - barHeightR / 2
                    );
                    xL += barWidthL + 1;
                    xR += barWidthR + 1;
                }
            }

            draw();
        } else if (visualSetting == "off") {
            canvasCtxL.clearRect(0, 0, WIDTH, HEIGHT);
            canvasCtxL.fillStyle = "red";
            canvasCtxL.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtxR.clearRect(0, 0, WIDTH, HEIGHT);
            canvasCtxR.fillStyle = "red";
            canvasCtxR.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtxDiff.clearRect(0, 0, WIDTH, HEIGHT);
            canvasCtxDiff.fillStyle = "red";
            canvasCtxDiff.fillRect(0, 0, WIDTH, HEIGHT);
        }
    }

    visualSelect.onchange = function () {
        window.cancelAnimationFrame(drawVisual);
        visualize();
    };

    mute.onclick = voiceMute;

    function voiceMute() {
        if (mute.id == "") {
            gainNodeL.gain.value = 0;
            gainNodeR.gain.value = 0;
            mute.id = "activated";
            mute.innerHTML = "Unmute";
        } else {
            gainNodeL.gain.value = 1;
            gainNodeR.gain.value = 1;
            mute.id = "";
            mute.innerHTML = "Mute";
        }
    }
}