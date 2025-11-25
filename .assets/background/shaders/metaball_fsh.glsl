#version 300 es
precision mediump float;

in vec2 vertexPosition;
out vec4 fragColor;

void main() {
	if(length(vertexPosition) > 1.0) discard;
	fragColor = vec4(1.0);
}