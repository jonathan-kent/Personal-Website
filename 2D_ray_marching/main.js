
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var camAngle = 0;
var camX = 50;
var camY = 50;

var sceneObjs = [];


class Circle {
  constructor (x, y, r){
    this.x = x;
    this.y = y;
    this.radius = r;
  }

  distance(x, y){
    return signedDistanceCircle(x, y, this)
  }

  draw(){
    drawCircle(this.x, this.y, this.radius);
  }
}

class Rectangle {
  constructor (x, y, xSize, ySize){
    this.x = x;
    this.y = y;
    this.xSize = xSize;
    this.ySize = ySize;
  }

  distance(x, y){
    return signedDistanceRect(x, y, this)
  }

  draw(){
    drawRect(this.x - this.xSize/2, this.y - this.ySize/2, this.xSize, this.ySize);
  }
}


function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCam(camX, camY, camAngle);
  for (var i=0; i<sceneObjs.length; i++){
    sceneObjs[i].draw();
  }
  sphereTracing(camX, camY, 0, 50);
}

function drawCam(x, y){
  var endX = Math.cos(camAngle)*10;
  var endY = Math.sin(camAngle)*10;
  var backX = Math.cos(camAngle + Math.PI/2)*10;
  var backY = Math.sin(camAngle + Math.PI/2)*10;
  ctx.beginPath();
  ctx.moveTo(x + endX, y + endY);
  ctx.lineTo(x - endX, y - endY);
  ctx.lineTo(x + backX, y + backY);
  ctx.fill();
  ctx.closePath();
}

function drawRect(xPos, yPos, xSize, ySize){
  ctx.beginPath();
  ctx.rect(xPos, yPos, xSize, ySize);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
}

function drawCircle(xPos, yPos, radius){
  ctx.beginPath();
  ctx.arc(xPos, yPos, radius, 0, 2*Math.PI);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.closePath();
}

function drawDistanceRing(x, y){
  var dist = 1000;
  for (var i=0; i<sceneObjs.length; i++){
    dist = Math.min(sceneObjs[i].distance(x, y), dist);
  }
  if (dist < 0){
    return;
  }
  ctx.beginPath();
  ctx.arc(x, y, dist, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();
  return dist;
}

function distance (x1, y1, x2, y2){
  var a = x2 - x1;
  var b = y2 - y1;
  return Math.sqrt((a * a) + (b * b));
}

function signedDistanceCircle(x, y, circle){
  var dist = distance(x, y, circle.x, circle.y);
  return dist - circle.radius;
}

function signedDistanceRect(x, y, rectangle){
  var dx = Math.max(Math.abs(x - rectangle.x) - rectangle.xSize / 2, 0);
  var dy = Math.max(Math.abs(y - rectangle.y) - rectangle.ySize / 2, 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function sphereTracing(x, y, iterations, maxIterations){
  if (iterations > maxIterations){
    return;
  }
  var radius = drawDistanceRing(x, y);
  if (radius < 1){
    ctx.beginPath();
    ctx.rect(x, y, 3, 3);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
    return;
  }
  var lineX = Math.cos(camAngle - Math.PI/2)*radius;
  var lineY = Math.sin(camAngle - Math.PI/2)*radius;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + lineX, y + lineY);
  ctx.stroke();
  ctx.closePath();
  iterations++;
  sphereTracing(x + lineX, y + lineY, iterations, maxIterations);
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("click", function(e){clickHandler(e)});

function keyDownHandler(e) {
  if(e.key == "Right" || e.key == "ArrowRight") {
      camAngle += (Math.PI/180)*5;
  }
  if(e.key == "Left" || e.key == "ArrowLeft") {
      camAngle -= (Math.PI/180)*5;
  }
  if(e.key == "Up" || e.key == "ArrowUp") {
      camX -= Math.cos(camAngle + Math.PI/2)*5;
      camY -= Math.sin(camAngle + Math.PI/2)*5;
  }
  if(e.key == "Down" || e.key == "ArrowDown") {
    camX += Math.cos(camAngle + Math.PI/2)*5;
    camY += Math.sin(camAngle + Math.PI/2)*5;
  }
}

function clickHandler(e){
  var rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;
  if (Math.random() > 0.5){
    var radius = Math.random() * 40;
    sceneObjs.push(new Circle(mouseX, mouseY, radius));
  } else {
    var xSize = Math.random() * 60;
    var ySize = Math.random() * 60;
    sceneObjs.push(new Rectangle(mouseX, mouseY, xSize, ySize));
  }
}

function onLoad(){
  sceneObjs.push(new Rectangle(350, 220, 50, 50));
  sceneObjs.push(new Circle(150, 100, 30));

  var interval = setInterval(draw, 10);
}

onLoad();
