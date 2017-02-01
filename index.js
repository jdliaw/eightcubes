"use strict";

var canvas;
var gl;

var NumVertices = 36;

var colors = [];
var points = [];

var model_transform_loc;
var camera_transform_loc;
var projection_transform_loc;
var projection_matrix;

var program;
var vBuffer;

// variables controlled by keys
var yPos = 0;
var xAngle = 0;
var fovAngle = 45; // default FOV

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
var PLUS_KEY = 187;

//8 cube positions
var cube_position = [
    vec3(10, 10, 10),
    vec3(10, 10, -10),
    vec3(10, -10, 10),
    vec3(10, -10, -10),
    vec3(-10, 10, 10),
    vec3(-10, 10, -10),
    vec3(-10, -10, 10),
    vec3(-10, -10, -10),
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

  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

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

    if (key == R_KEY) { // reset FOV
      yPos = 0;
      xAngle = 0;
      fovAngle = 45;
    }

    if (key == N_KEY) { // narrow FOV, scene shrinks
      fovAngle++;
    }
    if (key == W_KEY) { // widen FOV
      fovAngle--;
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

var i = 0;

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //cycle through 8 times to create each cube
  for (var i = 0; i < 8; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

      var colorLoc = gl.getUniformLocation(program, "vColor");
      var color = vec4(vertexColors[(i+cubeColor) % 8], 1.0);
      gl.uniform4fv(colorLoc, color);

      var model_transform = mat4();
      model_transform = mult(model_transform, translate(cube_position[i]));
      model_transform = mult(model_transform, translate(0, yPos, 0));

      projection_matrix = perspective(fovAngle, canvas.width / canvas.height, 0.001, 1000);
      projection_matrix = mult(projection_matrix, rotate(xAngle, 0, 1, 0));

      gl.uniformMatrix4fv(projection_transform_loc, false, flatten(projection_matrix));
      gl.uniformMatrix4fv(model_transform_loc, false, flatten(model_transform));

      gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
      gl.drawArrays(gl.LINES, 0, NumVertices);
  }

  requestAnimFrame( render );
}