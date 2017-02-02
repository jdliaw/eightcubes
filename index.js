"use strict";

var canvas;
var gl;

var NumVertices = 36;

var colors = [];
var points = [];
var edge_vertices = [];
var vPosition;
var program;
var vBuffer;
var lBuffer;
var chBuffer;
var j = 0;

// global vars for vertex shader
var model_transform_loc;
var camera_transform_loc;
var projection_transform_loc;
var projection_matrix;

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
var PLUS_KEY_CHROME = 187;

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
    [0.0, 0.0, 1.0, 0.6],  // blue
    [1.0, 0.0, 1.0, 1.0],  // magenta
    [0.0, 1.0, 1.0, 1.0],  // cyan
    [1.0, 0.0, 0.6, 0.5]   // pink
];

// axis for cubes to rotate on
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

// cycle through the values to scale up and down
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

// vertices for crosshair
var crosshair_vertices = [
  vec2(1.0, 0),
  vec2(-1.0, 0),
  vec2(0, 1.0),
  vec2(0, -1.0)
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  // setup webgl
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available.");
  }

  cube(); // populate points for a cube
  outline(); // populate points for cube edges

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // push cube points to buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

  vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // push crosshair points to buffer
  chBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(crosshair_vertices), gl.STATIC_DRAW );

  // for edges outline
  lBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(edge_vertices), gl.STATIC_DRAW);

  // matrices to manipulate cubes on canvas
  model_transform_loc = gl.getUniformLocation(program, "model_transform");
  camera_transform_loc = gl.getUniformLocation(program, "camera_transform");
  gl.uniformMatrix4fv(camera_transform_loc, false, flatten(translate(0, 0, -50)));
  projection_transform_loc = gl.getUniformLocation(program, "projection_transform");

  // key bindings
  window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

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
    if (key == LEFT_KEY) { // azimuth left
      xAngle--;
    }

    if (key == I_KEY) {
      position(xAngle, 1);
      xPos += adjustedX;
      zPos += adjustedZ;
    }

    if (key == M_KEY) {
      position(xAngle, 2);
      xPos += adjustedX;
      zPos += adjustedZ;
    }
    if (key == J_KEY) {
      position(xAngle, 3);
      xPos += adjustedX;
      zPos += adjustedZ;
    }
    if (key == K_KEY) {
      position(xAngle, 4);
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

    if (key == PLUS_KEY || key == PLUS_KEY_CHROME) { // toggle crosshair
      crosshairToggle = !crosshairToggle;
    }
  }

  render();

  // for 20rpm rotations
  // setInterval(render, 100); // call render every 100ms
  // setInterval(increaseRotationAmount, 100); // increase degree by 12 every time
}

function increaseRotationAmount() {
  j += 12;
}

function outline() { // construct collection of points to create edge outline (different from cube that draws triangles)
  edges_quad(0, 3, 7, 4);
  edges_quad(4, 0, 1, 5);
  edges_quad(5, 4, 7, 6);
  edges_quad(6, 5, 1, 2);
  edges_quad(2, 3, 7, 6);
  edges_quad(6, 2, 3, 7);
}

function edges_quad(a, b, c, d) {
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

  var edge_indices = [a, b, c, d, a, b]; // slight change in indices to get cube outline

  for (var i = 0; i < edge_indices.length; i++) {
    edge_vertices.push(vertices[edge_indices[i]]);
  }
}

function cube() { // construct points for cube
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
  }
}

var n = 1;
var k = 0;
function scaleFunc() { // function to calculate scaling
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
  j += 1.75;
  var sc = scaleFunc();
  //cycle through 8 times to create each cube
  for (var i = 0; i < 8; i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    // assign a different color to each cube, same color for all faces
    var color_loc = gl.getUniformLocation(program, "vColor");
    var color = vec4(vertexColors[(i+cubeColor) % 8], 1.0);
    gl.uniform4fv(color_loc, color);

    // matrix to allow transform, rotate, scale
    var model_transform = mat4();
    model_transform = mult(model_transform, translate(cube_position[i]));
    model_transform = mult(model_transform, translate(xPos, yPos, zPos));
    model_transform = mult(model_transform, rotate(j, rotationAxis[i]));

    // projection matrix can rotate as with key bindings
    projection_matrix = perspective(fovAngle, canvas.width / canvas.height, 0.001, 1000);
    projection_matrix = mult(projection_matrix, rotate(xAngle, 0, 1, 0));

    gl.uniformMatrix4fv(projection_transform_loc, false, flatten(projection_matrix));
    gl.uniformMatrix4fv(model_transform_loc, false, flatten(mult(model_transform, scale(scaleSelect[sc]))));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, NumVertices); // Triangle strip for extra credit

    // outline the edges
    gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer); // grab buffer with line points
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    color = vec4(1.0, 1.0, 1.0, 1.0); // white color outline
    gl.uniform4fv(color_loc, color);
    gl.lineWidth(2);
    gl.drawArrays(gl.LINES, 0, NumVertices); // draw as lines
  }

  // crosshair
  if (crosshairToggle) {
    gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer ); // grab buffer with crosshair points
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

    // crosshair is orthogonal, use a matrix to transform
    var ch_transform;
    ch_transform = mat4();
    ch_transform = mult(ch_transform, ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0));
    gl.uniformMatrix4fv(model_transform_loc, false, flatten(ch_transform));

    var color_loc = gl.getUniformLocation(program, "vColor");
    color = vec4(1.0, 1.0, 1.0, 1.0); // white crosshair
    gl.uniform4fv(color_loc, color);
    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, 4);

    // rebind to draw cubes
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  }

  requestAnimFrame( render );
}

function position(deg, direction) { // function to calculate position for ijkm key
  //get input degree within 360 degrees.
  var degree = deg;
  degree = degree % 360;

  //find the quadrant
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
  adjustedX *= 0.25;
  adjustedZ *= 0.25;
}