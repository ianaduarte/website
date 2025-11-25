#version 300 es
precision mediump float;

out vec2 vertexCoord;

const vec2 positions[4] = vec2[](
	vec2(-1.0, -1.0),
	vec2( 1.0, -1.0),
	vec2(-1.0,  1.0),
	vec2( 1.0,  1.0)
);

void main() {
	vertexCoord = positions[gl_VertexID];
	gl_Position = vec4(vertexCoord * 2.0 - 1.0, 0.0, 1.0);
}