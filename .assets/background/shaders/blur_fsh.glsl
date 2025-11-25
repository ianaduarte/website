#version 300 es
precision mediump float;

uniform vec2      uStride;
uniform vec2[128] uKernel;
uniform int       uKernelWidth;
uniform sampler2D uSampler;

in vec2 vertexCoord;
out vec4 fragColor;

void main() {
	for(int i = 0; i < uKernelWidth; i++) {
		fragColor += texture(uSampler, vertexCoord + uKernel[i].x * uStride) * uKernel[i].y;
	}
}