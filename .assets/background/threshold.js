import { context as glContext } from "./gl.js";
import * as GL from "./gl.js";


const thresholdFshSource = await fetch("/.assets/background/shaders/threshold_fsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));
const thresholdShader = GL.compileShaderProgram(
	GL.QUAD_VERTEX_PASS,
	GL.compileShaderPass(thresholdFshSource, glContext.FRAGMENT_SHADER)
);

const thresholdColor1UniformLocation = GL.getUniformLocation(thresholdShader, "uColor1");
const thresholdColor2UniformLocation = GL.getUniformLocation(thresholdShader, "uColor2");


let thresholdTexture = glContext.createTexture();
let thresholdFramebuffer = glContext.createFramebuffer();
glContext.bindTexture(glContext.TEXTURE_2D, thresholdTexture);
glContext.texStorage2D(glContext.TEXTURE_2D, 1, glContext.RGBA8, GL.canvas.width, GL.canvas.height);
glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

glContext.bindFramebuffer(glContext.FRAMEBUFFER, thresholdFramebuffer);
glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, thresholdTexture, 0);

glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
glContext.bindTexture(glContext.TEXTURE_2D, null);

window.addEventListener("resize", () => {
	glContext.deleteTexture(thresholdTexture);
	glContext.deleteFramebuffer(thresholdFramebuffer);
	
	thresholdTexture = glContext.createTexture();
	thresholdFramebuffer = glContext.createFramebuffer();
	
	glContext.bindTexture(glContext.TEXTURE_2D, thresholdTexture);
	glContext.texStorage2D(glContext.TEXTURE_2D, 1, glContext.RGBA8, GL.canvas.width, GL.canvas.height);
	glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
	glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

	glContext.bindFramebuffer(glContext.FRAMEBUFFER, thresholdFramebuffer);
	glContext.framebufferTexture2D(glContext.FRAMEBUFFER, glContext.COLOR_ATTACHMENT0, glContext.TEXTURE_2D, thresholdTexture, 0);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
	glContext.bindTexture(glContext.TEXTURE_2D, null);
});


//export const WAVE_COLOR1 = [0xEA / 255.0, 0xB7 / 255.0, 0xB3 / 255.0, 1];
//export const WAVE_COLOR2 = [0xEB / 255.0, 0xD5 / 255.0, 0xD1 / 255.0, 1];
//EAC5C1
export const WAVE_COLOR2 = [0xEA / 255.0, 0xC5 / 255.0, 0xC1 / 255.0, 1];
export const WAVE_COLOR1 = [0xF2 / 255.0, 0x9D / 255.0, 0xA0 / 255.0, 1];
//export const WAVE_COLOR2 = [1, 0, 0, 1];

export function process(partialFrames) {
	glContext.useProgram(thresholdShader);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, thresholdFramebuffer);
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
	
	glContext.uniform4fv(thresholdColor1UniformLocation, WAVE_COLOR1);
	glContext.uniform4fv(thresholdColor2UniformLocation, WAVE_COLOR2);
	glContext.bindTexture(glContext.TEXTURE_2D, GL.mainTexture);
	glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
	
	glContext.useProgram(GL.BLIT_SHADER);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, GL.mainFramebuffer);
	glContext.bindTexture(glContext.TEXTURE_2D, thresholdTexture);
	glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
}