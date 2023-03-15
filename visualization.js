document.getElementById("start-btn").addEventListener("click", (e) => {
  start();
});

function start() {

  var audioCtx = new AudioContext();
  var source;
  var stream;

  var mute = document.querySelector(".mute");

  var analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  var gainNode = audioCtx.createGain();

  var canvas = document.querySelector(".visualizer");
  var canvasCtx = canvas.getContext("2d");

  var intendedWidth = document.querySelector(".wrapper").clientWidth;

  canvas.setAttribute("width", intendedWidth);

  var visualSelect = document.getElementById("visual");

  var drawVisual;


  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {
        audio: true,
      },

      // Success callback
      function (stream) {
        source = audioCtx.createMediaStreamSource(stream);
        //console.log('numOfInputs: ' + source.numberOfInputs); // 0
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioCtx.destination);

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
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    var visualSetting = visualSelect.value;
    console.log(visualSetting);

    if (visualSetting == "sinewave") {
      analyser.fftSize = 1024;
      var bufferLength = analyser.fftSize;
      console.log(bufferLength);
      var dataArray = new Float32Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyser.getFloatTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";

        canvasCtx.beginPath();

        var sliceWidth = (WIDTH * 1.0) / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
          var v = dataArray[i] * 200.0;
          var y = HEIGHT / 2 + v;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      draw();
    } else if (visualSetting == "frequencybars") {
      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      console.log(bufferLength);
      var dataArray = new Float32Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyser.getFloatFrequencyData(dataArray);

        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] + 140) * 2;

          canvasCtx.fillStyle =
            "rgb(" + Math.floor(barHeight + 100) + ",50,50)";
          canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }
      }

      draw();
    } else if (visualSetting == "off") {
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "red";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  visualSelect.onchange = function () {
    window.cancelAnimationFrame(drawVisual);
    visualize();
  };

  mute.onclick = voiceMute;

  function voiceMute() {
    if (mute.id == "") {
      gainNode.gain.value = 0;
      mute.id = "activated";
      mute.innerHTML = "Unmute";
    } else {
      gainNode.gain.value = 1;
      mute.id = "";
      mute.innerHTML = "Mute";
    }
  }
}