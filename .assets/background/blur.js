//https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/main/29.fbo.blur.variable.js
import { context as glContext } from "./gl.js";
import * as GL from "./gl.js";


const blurFshSource = await fetch("/.assets/background/shaders/blur_fsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));

const blurShader = GL.compileShaderProgram(
	GL.QUAD_VERTEX_PASS,
	GL.compileShaderPass(blurFshSource, glContext.FRAGMENT_SHADER)
);

let blurTexture = glContext.createTexture();
let blurFramebuffer = glContext.createFramebuffer();
glContext.bindTexture(glContext.TEXTURE_2D, blurTexture);
glContext.texStorage2D(glContext.TEXTURE_2D, 1, glContext.RGBA8, GL.canvas.width, GL.canvas.height);
glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

glContext.bindFramebuffer(glContext.FRAMEBUFFER, blurFramebuffer);
glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, blurTexture, 0);

glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
glContext.bindTexture(glContext.TEXTURE_2D, null);

window.addEventListener("resize", () => {
	glContext.deleteTexture(blurTexture);
	glContext.deleteFramebuffer(blurFramebuffer);
	
	blurTexture = glContext.createTexture();
	blurFramebuffer = glContext.createFramebuffer();
	
	glContext.bindTexture(glContext.TEXTURE_2D, blurTexture);
	glContext.texStorage2D(glContext.TEXTURE_2D, 1, glContext.RGBA8, GL.canvas.width, GL.canvas.height);
	glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
	glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

	glContext.bindFramebuffer(glContext.FRAMEBUFFER, blurFramebuffer);
	glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, blurTexture, 0);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
	glContext.bindTexture(glContext.TEXTURE_2D, null);
});

function generate1DKernel(width) {
	if ((width & 1) !== 1) throw new Error('Only odd guassian kernel sizes are accepted');

	// Small sigma gaussian kernels are a problem. You usually need to add an error correction
	// algorithm. But since our kernels grow in discrete intervals, we can just pre-compute the
	// problematic ones. These values are derived from the Pascal's Triangle algorithm.
	const smallKernelLerps = [
        [1.0],
        [0.25, 0.5, 0.25],
        [0.0625, 0.25, 0.375, 0.25, 0.0625],
        [0.03125, 0.109375, 0.21875, 0.28125, 0.21875, 0.109375, 0.03125],
	];
	if (width < 9) return smallKernelLerps[(width - 1) >> 1];

	const kernel = [];
	const sigma = width / 6;     // Adjust as required
	const radius = (width - 1) / 2;

	let sum = 0;

	// Populate the array with gaussian kernel values
	for (let i = 0; i < width; i++) {
		const offset = i - radius;

		const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
		const exponent = -(offset * offset) / (2 * (sigma * sigma));
		const value = coefficient * Math.exp(exponent);

		// We'll need this for normalization below
		sum += value;

		kernel.push(value);
	}

	// Normalize the array
	for (let i = 0; i < width; i++) {
		kernel[i] /= sum;
	}

	return kernel;
}
function convertKernelToOffsetsAndScales(kernel) {
	if ((kernel.length & 1) === 0) throw new Error('Only odd kernel sizes can be lerped');

	const radius = Math.ceil(kernel.length / 2);
	const data = [];

	// Prepopulate the array with the first cell as the lone weight value
	let offset = -radius + 1;
	let scale = kernel[0];
	data.push(offset, scale);

	const total = kernel.reduce((c,v) => c+v);

	for (let i = 1; i < kernel.length; i+= 2) {
		const a = kernel[i];
		const b = kernel[i + 1];

		offset = -radius + 1 + i + (b / (a + b));
		scale = (a + b) / total;
		data.push(offset, scale);
	}

	return data
}


const blurStrideUniformLocation = GL.getUniformLocation(blurShader, "uStride");
const blurKernelLocation        = GL.getUniformLocation(blurShader, "uKernel");
const blurKernelWidthLocation   = GL.getUniformLocation(blurShader, "uKernelWidth")

const offsetsAndScales = new Float32Array(256);
const kernelWidth = 33;

const kernel1D = generate1DKernel(kernelWidth);
const lerpKernel = convertKernelToOffsetsAndScales(kernel1D);
const numberOfOffsetsAndScales = lerpKernel.length / 2;
offsetsAndScales.set(lerpKernel);


function blur1d(sourceTexture, destinationFBO, unidirectionalUVStride) {
	glContext.bindTexture(glContext.TEXTURE_2D, sourceTexture);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, destinationFBO);

	glContext.uniform2fv(blurStrideUniformLocation, unidirectionalUVStride);
	glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
}
export function process(partialFrames) {
	glContext.useProgram(blurShader);
	glContext.uniform2fv(blurKernelLocation, offsetsAndScales);
	glContext.uniform1i(blurKernelWidthLocation, numberOfOffsetsAndScales);
	
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, blurFramebuffer);
	blur1d(GL.mainTexture, blurFramebuffer, [1 / GL.canvas.width, 0]);
	blur1d(blurTexture, GL.mainFramebuffer, [0, 1 / GL.canvas.height]);
}