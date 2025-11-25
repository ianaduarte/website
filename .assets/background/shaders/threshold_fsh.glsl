#version 300 es
precision mediump float;

uniform sampler2D uSampler;
uniform vec4 uColor1;
uniform vec4 uColor2;

in vec2 vertexCoord;
out vec4 fragColor;

void main() {
	vec4 color = texture(uSampler, vertexCoord);
	if(color.a < 0.25) discard;
	
	color = mix(uColor1, uColor2, vertexCoord.y);
	color.a = 1.0;
	fragColor = color;
}