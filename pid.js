"use strict";

(function() {
  var d = document.getElementById("d");
  var dtx = d.getContext("2d");

  ////////// DISPLAY RELATED //////////
  var c = document.getElementById("c");
  var ctx = c.getContext("2d");

  function resizeCanvas() {
    c.width = window.innerWidth * 0.2;
    c.height = window.innerHeight;
    d.width = window.innerWidth * 0.8;
    d.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  ////////// PID //////////
  var x = c.width / 2;
  var y = window.innerHeight - 30;
  var v = 0;

  var setpoint = y;
  var prevError = 0;
  var integral = 0;

  var kp = 3.0;
  var ki = 0.01;
  var kd = 80.0;
  var windup = 20.0;

  var history = [[]];
  var historyTick = 0;
  var lastError = 0;
  var lastLastY = 0;
  var lastY = 0;

  function pid() {
    var error = setpoint - lastLastY;
    integral += error;

    if (integral < -windup) {
      integral = -windup;
    } else if (integral > windup) {
      integral = windup;
    }
    var derivative = error - prevError;
    prevError = error;

    lastLastY = lastY;
    lastY = y;

    return 0.001 * (kp * error + ki * integral + kd * derivative);
  }

  function update() {
    var a = pid();
    var maxA = 0.2;
    a = Math.max(Math.min(a, maxA), -maxA);
    v += a;
    y += v;

    if (++historyTick == 1) {
      historyTick = 0;

      if (history.length >= 1000) {
        history.shift();
      }
      history.push([y, setpoint]);
    }

    console.log(history);

    ctx.fillStyle = "#F4F4F4";
    ctx.fillRect(0, 0, c.width, c.height);
    dtx.fillStyle = "#FFF";
    dtx.fillRect(0, 0, d.width, d.height);

    dtx.setLineDash([]);
    dtx.beginPath();
    dtx.moveTo(0, history[0][0]);
    dtx.strokeStyle = "rgba(0,0,0,1)";
    for (var i = 1; i < history.length; i++) {
      dtx.lineTo(i, history[i][0]);
    }
    dtx.stroke();

    dtx.setLineDash([8, 14]);
    dtx.beginPath();
    dtx.strokeStyle = "rgba(0,0,255,0.8)";
    dtx.moveTo(0, history[0][1]);
    for (var i = 1; i < history.length; i++) {
      dtx.lineTo(i, history[i][1]);
    }
    dtx.stroke();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 14]);
    ctx.beginPath();
    ctx.moveTo(0, setpoint);
    ctx.lineTo(c.width, setpoint);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#6D6D6D";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + a * 300);
    ctx.stroke();
    // requestAnimationFrame(update);
    setTimeout(update, 16);
  }

  update(0);

  ////////// CLICKS //////////
  function canvasClick(e) {
    setpoint = e.clientY;
  }
  c.addEventListener("click", canvasClick);

  ////////// FORM //////////
  var kpInput = document.getElementById("kp");
  var kiInput = document.getElementById("ki");
  var kdInput = document.getElementById("kd");
  var reset = document.getElementById("reset");

  reset.addEventListener("click", () => {
    x = c.width / 2;
    y = window.innerHeight - 30;
    v = 0;
    setpoint = y;
    prevError = 0;
    integral = 0;
    history = [];
    historyTick = 0;
  });

  function updateCoefficients() {
    kp = parseFloat(kpInput.value);
    ki = parseFloat(kiInput.value);
    kd = parseFloat(kdInput.value);
    integral = 0;
  }

  kpInput.addEventListener("blur", updateCoefficients);
  kiInput.addEventListener("blur", updateCoefficients);
  kdInput.addEventListener("blur", updateCoefficients);

  kpInput.value = kp;
  kiInput.value = ki;
  kdInput.value = kd;
})();
