#version 300 es
precision mediump float;

uniform vec2 uResolution;
uniform vec3 uParams; //phase, period, amplitude

in vec2 vertexCoord;
out vec4 fragColor;

void main() {
	vec3 normParams = uParams;
	normParams.z /= uResolution.y;
	float x = 0.35 + sin((vertexCoord.x * normParams.y) + normParams.x) * normParams.z;
	
	if(vertexCoord.y > x) discard;
	fragColor = vec4(1.0);
}