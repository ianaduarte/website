import { context as glContext } from "./gl.js";
import * as GL from "./gl.js";
import * as Blur from "./blur.js";
import * as Threshold from "./threshold.js";
import * as Metaballs from "./metaballs.js";
import * as Sinewave  from "./sinewave.js";

let lastFrame = 0;

export function drawBackground(partialFrames) {
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, GL.mainFramebuffer);
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
	Sinewave.updateAndDraw(partialFrames);
	Metaballs.updateAndDraw(partialFrames);
	
	Blur.process(partialFrames);
	Threshold.process(partialFrames);
	
	glContext.useProgram(GL.BLIT_SHADER);
	glContext.bindFramebuffer(glContext.FRAMEBUFFER, null);
	glContext.bindTexture(glContext.TEXTURE_2D, GL.mainTexture);
	glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
}