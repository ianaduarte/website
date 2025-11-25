#version 300 es
precision mediump float;

uniform vec2  uResolution;
uniform vec2  uOffset;
uniform float uRadius;

in vec2 aPos;
out vec2 vertexPosition;

void main() {
	vec2 pos = (aPos * uRadius + uOffset) / uResolution;
	
	vertexPosition = aPos;
	gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}