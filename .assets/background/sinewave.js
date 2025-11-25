import { context as glContext } from "./gl.js";
import * as GL from "./gl.js";

const sineFshSource = await fetch("/.assets/background/shaders/sine_fsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));

const sineShader = GL.compileShaderProgram(
	GL.QUAD_VERTEX_PASS,
	GL.compileShaderPass(sineFshSource, glContext.FRAGMENT_SHADER)
);


const sineResolutionUniformLocation = GL.getUniformLocation(sineShader, "uResolution");
const sineParamsUniformLocation     = GL.getUniformLocation(sineShader, "uParams");

export const WAVE_SPEED     = 0.06;
export const WAVE_PERIOD    = 8;
export const WAVE_AMPLITUDE = 100;
export let wavePhase = 0;

export function updateAndDraw(partialFrames) {
	wavePhase += WAVE_SPEED * partialFrames;
	glContext.useProgram(sineShader);
	glContext.uniform2fv(sineResolutionUniformLocation, [GL.canvas.width, GL.canvas.height]);
	glContext.uniform3fv(sineParamsUniformLocation    , [wavePhase, WAVE_PERIOD, WAVE_AMPLITUDE]);
	glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
}