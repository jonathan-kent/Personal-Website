var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


class Vec3 {
  constructor (x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(vector){
    var addX = this.x + vector.x;
    var addY = this.y + vector.y;
    var addZ = this.z + vector.z;
    return new Vec3(addX, addY, addZ);
  }
  sub(vector){
    var subX = this.x - vector.x;
    var subY = this.y - vector.y;
    var subZ = this.z - vector.z;
    return new Vec3(subX, subY, subZ);
  }
  mult(multiplier){
    var multX = this.x * multiplier;
    var multY = this.y * multiplier;
    var multZ = this.z * multiplier;
    return new Vec3(multX, multY, multZ);
  }
  length(){
    var a = Math.sqrt((this.x * this.x) + (this.y * this.y));
    return Math.sqrt((a * a) + (this.z * this.z));
  }
  normalize(){
    var length = this.length();
    if (length == 0) return this;
    this.x = this.x / length;
    this.y = this.y / length;
    this.z = this.z / length;
    return this;
  }
  dot(vector){
    return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
  }
  absoluteVal(){
    return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
  }
  max(num){
    var maxX = Math.max(this.x, num);
    var maxY = Math.max(this.y, num);
    var maxZ = Math.max(this.z, num);
    return new Vec3(maxX, maxY, maxZ);
  }
}

// plane at with a at z=0;
class Plane {
  sd(pos){
    return pos.z;
  }
}

class Sphere {
  constructor(position, radius){
    this.p = position;
    this.r = radius;
  }
  //signed distance function to the edge of the sphere
  sd(pos){
    var spherePos = this.p;
    var subbed = pos.sub(spherePos);
    var totalLength = subbed.length();
    var final = totalLength - this.r;
    return final;
  }
}

class Box {
  constructor(position, dimensions){
    this.p = position;
    this.d = dimensions;
  }
  //signed distance function to the edge of the box
  sd(pos){
    var q = (pos.sub(this.p)).absoluteVal();
    q = q.sub(this.d);
    return (q.max(0)).length(); + Math.min(Math.max(Math.max(q.y, q.z), q.x), 0);
  }
}

function rayMarch(origin, direction){
  var distanceFromOrigin = 0;
  for (let i=0; i<100; i++){
    //march the ray in the specified direction and the distance from the nearest object
    var p = origin.add(direction.mult(distanceFromOrigin));
    var dist = getDist(p);
    distanceFromOrigin += dist;
    //break if exceeding max distance from camera or have a collision
    if (distanceFromOrigin > 100 || dist < 0.01){
      break;
    }
  }
  return distanceFromOrigin;
}

function getDist(pos){
  var dist = 1000;
  // go through every object in the scene and take the smallest of their signed distances
  for (let i=0; i<sceneObjs.length; i++){
    dist = Math.min(sceneObjs[i].sd(pos), dist);
  }
  if (dist < 0){
    return 0;
  }
  return dist;
}

function getNormal(pos){
  var dist = getDist(pos);
  // small offsets to get a point near the collision point
  var xyy = new Vec3(0.0001, 0, 0);
  var yxy = new Vec3(0, 0.0001, 0);
  var yyx = new Vec3(0, 0, 0.0001);
  var a = getDist(pos.sub(xyy));
  var b = getDist(pos.sub(yxy));
  var c = getDist(pos.sub(yyx));
  var normal = new Vec3(dist - a, dist - b, dist - c);
  return normal.normalize();
}

function getLight(pos){
  // light vector from the position towards the light source
  var light = (lightPos.sub(pos)).normalize();
  var normal = getNormal(pos);
  // dot product of the normal and a light vector determines the amount of light
  var diffuse = normal.dot(light);
  // bound the numbers between 0 and 1
  diffuse = clamp(diffuse, 0, 1);

  //shadows
  var offSurface = normal.mult(0.02);
  //move in the direction of the light source to detect collisions
  var bounce = rayMarch(pos.add(offSurface), light);
  var distToLight = (lightPos.sub(pos)).length();
  // if their is a collision between the point and the light source then the point is in shadow
  // points in the shadows have 10% of the light
  if (bounce < distToLight){
    diffuse = diffuse * 0.1;
  }
  return diffuse;
}

function clamp(num, low, high){
  return Math.max(Math.min(num, high), low);
}


function drawToScreen(pos){
  var imgData = ctx.createImageData(canvas.width, canvas.height);

  // direction vectors passing through the "screen"
  // start at the top left and move across each row then down
  var xDir = -1;
  var yDir = 1;
  var zDir = 1;
  while (zDir > -1){
    xDir = -1;
    while (xDir < 1){
      var direction =  new Vec3(xDir, yDir, zDir);
      var normalized = direction.normalize();
      var distance = rayMarch(camera, normalized);
      var point = camera.add(normalized.mult(distance));
      var diffuse = getLight(point);

      // draw to the pixel through which the ray passed
      var x = Math.round((xDir+1) * canvas.width/2);
      var y = Math.round(canvas.height - (zDir+1) * canvas.height/2);
      var index = (x + (y * canvas.width)) * 4

      var r = 0;
      var g = 0;
      var b = 0;
      // color the pixels according the amount of light they recieve
      if (distance < 100){
        var color = Math.abs(diffuse);
        r = color * 255;
        g = color * 255;
        b = color * 255;
      }

      // render normals
      /*
      if (distance < 100){
        var color = getNormal(point);
        r = Math.abs(color.x * 255);
        g = Math.abs(color.y * 255);
        b = Math.abs(color.z * 255);
      }
      */
      // render without light
      /*
      if (distance < 100){
        r = 255;
        g = 0;
        b = 0;
      }
      */

      imgData.data[index] = r;
      imgData.data[index+1] = g;
      imgData.data[index+2] = b;
      imgData.data[index+3] = 255;

      //move update the direction ray to pass through the pixel to the right
      xDir += 2/canvas.width;
    }
    zDir -= 2/canvas.height;
  }
  ctx.putImageData(imgData, 0, 0);
}

function newFrame(){
  //change position of a light in a circle then render again
  time += 0.2;
  lightPos.x += Math.sin(time);
  lightPos.y += Math.cos(time);
  drawToScreen();
}

function onLoad(){
  // sphere renders about twice as fast as the box
  // scene with box sphere and plane renders at ~0.5 fps
  sceneObjs.push(new Plane());
  sceneObjs.push(new Sphere(new Vec3(0, 6, 1), 1));
  sceneObjs.push(new Box(new Vec3(2, 4, 0.25), new Vec3(0.5, 0.5, 0.25)));

  var interval = setInterval(newFrame, 10);
}


sceneObjs = [];
camera = new Vec3(0, 0, 1);
lightPos = new Vec3(-2, 6, 5);
time = 0;

onLoad();
