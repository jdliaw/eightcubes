"use strict";

var canvas;
var gl;

var NumVertices = 36;

var colors = [];
var points = [];
var vPosition;

var model_transform_loc;
var camera_transform_loc;
var projection_transform_loc;
var projection_matrix;

var program;
var vBuffer;
var lBuffer;
var chBuffer;
var j = 0;

// variables controlled by keys
var yPos = 0;
var xAngle = 0;
var zPos = 0;
var xPos = 0;
var fovAngle = 45; // default FOV
var crosshairToggle = false;
var adjustedX;
var adjustedZ;

// Key constants
var C_KEY = 67;
var UP_KEY = 38;
var DOWN_KEY = 40;
var LEFT_KEY = 37
var RIGHT_KEY = 39
var I_KEY = 73;
var J_KEY = 74;
var K_KEY = 75;
var M_KEY = 77;
var R_KEY = 82;
var N_KEY = 78;
var W_KEY = 87;
var PLUS_KEY = 61; // chrome = 187, firefox = 61

//8 cube positions
var cube_position = [
    vec3(10, 10, 10),
    vec3(10, 10, -10),
    vec3(10, -10, 10),
    vec3(10, -10, -10),
    vec3(-10, 10, 10),
    vec3(-10, 10, -10),
    vec3(-10, -10, 10),
    vec3(-10, -10, -10)
];

//8 cube colors to cycle through
var cubeColor = 0;
var vertexColors = [
    [0.8, 0.5, 0.0, 1.0],  // orange
    [1.0, 0.0, 0.0, 1.0],  // red
    [1.0, 1.0, 0.0, 1.0],  // yellow
    [0.0, 1.0, 0.0, 1.0],  // green
    [0.0, 0.0, 1.0, 1.0],  // blue
    [1.0, 0.0, 1.0, 1.0],  // magenta
    [0.0, 1.0, 1.0, 1.0],  // cyan
    [1.0, 0.0, 0.6, 1.0]   // pink
];

var rotationAxis = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0]
];

var scaleSelect = [
  [.82, .82, .82],
  [.84, .84, .84],
  [.86, .86, .86],
  [.88, .88, .88],
  [.90, .90, .90],
  [.92, .92, .92],
  [.94, .94, .94],
  [.96, .96, .96],
  [.98, .98, .98],
  [1.0, 1.0, 1.0],
  [1.02, 1.02, 1.02],
  [1.04, 1.04, 1.04],
  [1.06, 1.06, 1.06],
  [1.08, 1.08, 1.08],
  [1.10, 1.10, 1.10],
  [1.12, 1.12, 1.12],
  [1.14, 1.14, 1.14],
  [1.16, 1.16, 1.16]
];

// var edge_vertices = [
//   vec4(-0.5, -0.5,  1.5, 1.0),//1
//   vec4(-0.5,  0.5,  1.5, 1.0),//2
//   vec4(-0.5, -0.5,  1.5, 1.0),//1
//   vec4(0.5, -0.5,  1.5, 1.0),//4
//   vec4(-0.5, -0.5,  1.5, 1.0),//1
//   vec4(-0.5, -0.5, 0.5, 1.0),//5
//   vec4(-0.5,  0.5,  1.5, 1.0),//2
//   vec4(0.5,  0.5,  1.5, 1.0),//3
//   vec4(-0.5,  0.5,  1.5, 1.0),//2
//   vec4(-0.5,  0.5, 0.5, 1.0),//6
//   vec4(0.5,  0.5,  1.5, 1.0),//3
//   vec4(0.5, -0.5,  1.5, 1.0),//4
//   vec4(0.5,  0.5,  1.5, 1.0),//3
//   vec4(0.5,  0.5, 0.5, 1.0),//7
//   vec4(0.5, -0.5,  1.5, 1.0),//4
//   vec4( 0.5, -0.5, 0.5, 1.0), //8
//   vec4(-0.5, -0.5, 0.5, 1.0),//5
//   vec4(-0.5,  0.5, 0.5, 1.0),//6
//   vec4(-0.5, -0.5, 0.5, 1.0),//5
//   vec4( 0.5, -0.5, 0.5, 1.0), //8
//   vec4(-0.5,  0.5, 0.5, 1.0),//6
//   vec4(0.5,  0.5, 0.5, 1.0),//7
//   vec4(0.5,  0.5, 0.5, 1.0),//7
//   vec4( 0.5, -0.5, 0.5, 1.0) //8
// ];

var edge_vertices = [
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),//
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5,  0.5,  0.5, 1.0 ),//
  // vec4(  0.5,  0.5,  0.5, 1.0 ),
  // vec4(  0.5, -0.5,  0.5, 1.0 ),//
  // vec4(  0.5, -0.5,  0.5, 1.0 ),
  // vec4( -0.5, -0.5,  0.5, 1.0 ),//
//   // vec4( -0.5, -0.5, -0.5, 1.0 ),
//   // vec4( -0.5,  0.5, -0.5, 1.0 ),
//   // vec4(  0.5,  0.5, -0.5, 1.0 ),
//   // vec4(  0.5, -0.5, -0.5, 1.0 )
//   //
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(5.0,  0.0,  0.0, 1.0),
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(0.0,  5.0,  0.0, 1.0),
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(0.0,  0.0,  5.0, 1.0),
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(-5.0,  0.0,  0.0, 1.0),
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(0.0,  -5.0,  0.0, 1.0),
//   // vec4(0.0, 0.0,  0.0, 1.0),
//   // vec4(0.0,  0.0,  -5.0, 1.0)
];

var crosshair_vertices = [
  vec2(1.0, 0),
  vec2(-1.0, 0),
  vec2(0, 1.0),
  vec2(0, -1.0)
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available.");
  }

  cube();

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // crosshair points
  // chBuffer = gl.createBuffer();
  // gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer );
  // gl.bufferData( gl.ARRAY_BUFFER, flatten(crosshair_vertices), gl.STATIC_DRAW );

  // lBuffer = gl.createBuffer(); // for edges outline
  // gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(edge_vertices), gl.STATIC_DRAW);

  // var lPosition = gl.getAttribLocation(program, "vPosition");

  model_transform_loc = gl.getUniformLocation(program, "model_transform");
  camera_transform_loc = gl.getUniformLocation(program, "camera_transform");
  gl.uniformMatrix4fv(camera_transform_loc, false, flatten(translate(0, 0, -50)));

  //projection matrix
  projection_transform_loc = gl.getUniformLocation(program, "projection_transform");
  // projection_matrix = perspective(45, canvas.width / canvas.height, 0.001, 1000);
  // gl.uniformMatrix4fv(projection_transform_loc, false, flatten(projection_matrix));

  // key bindings
  window.onkeydown = function(e) {
    var key;

    if (e.keyCode) {
      key = e.keyCode;
    }
    else {
      key = e.which;
    }
    // console.log(key);

    if (key == C_KEY) { // toggle colors
      cubeColor++;
      render();
    }

    if (key == UP_KEY) { // move up
      yPos += 0.25;
    }
    if (key == DOWN_KEY) { // move down
      yPos -= 0.25;
    }

    if (key == RIGHT_KEY) { // azimuth right
      xAngle++;
    }
    if (key == LEFT_KEY) {
      xAngle--;
    }

    if (key == I_KEY) {
      calculatePos(xAngle, 1);
      xPos += adjustedX;
      zPos += adjustedZ;
    }

    if (key == M_KEY) {
      calculatePos(xAngle, 2);
      xPos += adjustedX;
      zPos += adjustedZ;
    }
    if (key == J_KEY) {
      calculatePos(xAngle, 3);
      xPos += adjustedX;
      zPos += adjustedZ;
    }
    if (key == K_KEY) {
      calculatePos(xAngle, 4);
      xPos += adjustedX;
      zPos += adjustedZ;
    }

    if (key == R_KEY) { // reset FOV
      yPos = 0;
      xPos = 0;
      zPos = 0;
      adjustedZ = 0;
      adjustedX = 0;
      xAngle = 0;
      fovAngle = 45;
    }

    if (key == N_KEY) { // narrow FOV, scene shrinks
      fovAngle++;
    }
    if (key == W_KEY) { // widen FOV
      fovAngle--;
    }

    if (key == PLUS_KEY) { // crosshair
      crosshairToggle = !crosshairToggle;
    }
  }

  render();
}

function cube() {
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) {
  var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
  ];

  var indices = [ a, b, c, a, c, d ];

  for ( var i = 0; i < indices.length; ++i ) {
    points.push(vertices[indices[i]]);
    // colors.push(vertexColors[a]);
  }
}

var n = 1;
var k = 0;
function scaleMath() {
  k = k + 0.10 * n;
  if (k > 16.9) {
    n = -1;
  }
  else if (k < 0.1) {
    n = 1;
  }
  return Math.floor(k);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  j += 1.6;
  var sc = scaleMath();
  //cycle through 8 times to create each cube
  for (var i = 0; i < 8; i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    // gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);

    var color_loc = gl.getUniformLocation(program, "vColor");
    var color = vec4(vertexColors[(i+cubeColor) % 8], 1.0);
    gl.uniform4fv(color_loc, color);

    var model_transform = mat4();
    model_transform = mult(model_transform, translate(cube_position[i]));
    model_transform = mult(model_transform, translate(xPos, yPos, zPos));
    model_transform = mult(model_transform, rotate(j, rotationAxis[i]));

    projection_matrix = perspective(fovAngle, canvas.width / canvas.height, 0.001, 1000);
    projection_matrix = mult(projection_matrix, rotate(xAngle, 0, 1, 0));

    gl.uniformMatrix4fv(projection_transform_loc, false, flatten(projection_matrix));
    // console.log(sc);
    gl.uniformMatrix4fv(model_transform_loc, false, flatten(mult(model_transform, scale(scaleSelect[sc]))));

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    // outline the edges
    // gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
    color = vec4(1.0, 1.0, 1.0, 1.0);
    gl.uniform4fv(color_loc, color);
    gl.lineWidth(2);
    gl.drawArrays(gl.LINES, 0, NumVertices);
  }

  // crosshair
  if (crosshairToggle) {
    chBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(crosshair_vertices), gl.STATIC_DRAW );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

    var ch_transform;
    ch_transform = mat4();
    ch_transform = mult(ch_transform, ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0));
    gl.uniformMatrix4fv(model_transform_loc, false, flatten(ch_transform));

    var color_loc = gl.getUniformLocation(program, "vColor");
    color = vec4(1.0, 1.0, 1.0, 1.0);
    gl.uniform4fv(color_loc, color);
    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, 4);

    // rebind to draw cubes
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  }

  requestAnimFrame( render );
}

function calculatePos(deg, direction) {
  //get input degree and make it within 360 degrees.
  var degree = deg;
  degree = degree % 360;

  //find out what quadrant it is in.
  if (degree < 0) {
    degree += 360;
  }
  var quadrant1 = false;
  var quadrant2 = false;
  var quadrant3 = false;
  var quadrant4 = false;

  if (degree < 90) {
    quadrant1 = true;
  }
  else if (degree < 180) {
    quadrant2 = true;
  }
  else if (degree < 270) {
    quadrant3 = true;
  }
  else if (degree < 360) {
    quadrant4 = true;
  }

  // var rad = degree * Math.PI / 180;
  if (quadrant1) {
    var rad = degree * Math.PI / 180;
    if (direction === 1) {
        adjustedX = -Math.sin(rad);
        adjustedZ = Math.cos(rad);
    }
    else if (direction === 2) {
        adjustedX = Math.sin(rad);
        adjustedZ = -Math.cos(rad);
    }
    else if (direction === 3) {
        adjustedX = Math.cos(rad);
        adjustedZ = Math.sin(rad);
    }
    else if (direction === 4) {
        adjustedX = -Math.cos(rad);
        adjustedZ = -Math.sin(rad);
    }
  }
  else if (quadrant2) {
    var rad = (degree - 90) * Math.PI / 180;
    if (direction === 1) {
        adjustedX = -Math.cos(rad);
        adjustedZ = -Math.sin(rad);
    }
    else if (direction === 2) {
        adjustedX = Math.cos(rad);
        adjustedZ = Math.sin(rad);
    }
    else if (direction === 3) {
        adjustedX = -Math.sin(rad);
        adjustedZ = Math.cos(rad);
    }
    else if (direction === 4) {
        adjustedX = Math.sin(rad);
        adjustedZ = -Math.cos(rad);
    }
  }
  //opp of quad 1
  else if (quadrant3) {
    var rad = (degree - 180) * Math.PI / 180;
    if (direction === 1) {
        adjustedX = Math.sin(rad);
        adjustedZ = -Math.cos(rad);
    }
    else if (direction === 2) {
        adjustedX = -Math.sin(rad);
        adjustedZ = Math.cos(rad);
    }
    else if (direction === 3) {
        adjustedX = -Math.cos(rad);
        adjustedZ = -Math.sin(rad);
    }
    else if (direction === 4) {
        adjustedX = Math.cos(rad);
        adjustedZ = Math.sin(rad);
    }
  }
  else if (quadrant4) {
    var rad = (degree - 270) * Math.PI / 180;
    if (direction === 1) {
        adjustedX = Math.cos(rad);
        adjustedZ = Math.sin(rad);
    }
    else if (direction === 2) {
        adjustedX = -Math.cos(rad);
        adjustedZ = -Math.sin(rad);
    }
    else if (direction === 3) {
        adjustedX = Math.sin(rad);
        adjustedZ = -Math.cos(rad);
    }
    else if (direction === 4) {
        adjustedX = -Math.sin(rad);
        adjustedZ = Math.cos(rad);
    }
  }
}