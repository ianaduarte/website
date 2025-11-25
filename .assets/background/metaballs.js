import { context as glContext } from "./gl.js";
import * as GL       from "./gl.js";
import * as Sinewave from "./sinewave.js";

const ballVshSource = await fetch("/.assets/background/shaders/metaball_vsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));
const ballFshSource = await fetch("/.assets/background/shaders/metaball_fsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));

const ballShader = GL.compileShaderProgram(
	GL.compileShaderPass(ballVshSource, glContext.VERTEX_SHADER),
	GL.compileShaderPass(ballFshSource, glContext.FRAGMENT_SHADER)
);

const ballPositionAttribLocation    = GL.getAttribLocation (ballShader, "aPos");
const ballResolutionUniformLocation = GL.getUniformLocation(ballShader, "uResolution");
const ballOffsetUniformLocation     = GL.getUniformLocation(ballShader, "uOffset");
const ballRadiusUniformLocation     = GL.getUniformLocation(ballShader, "uRadius");

const circleVertices = [
	 0.0000,  2.0,
    -1.7321, -1.0,
	 1.7321, -1.0
];
const circleGeoBuffer = new Float32Array(circleVertices);
const circleVBO = glContext.createBuffer();
glContext.bindBuffer(glContext.ARRAY_BUFFER, circleVBO);
glContext.bufferData(glContext.ARRAY_BUFFER, circleGeoBuffer, glContext.STATIC_DRAW);


class MetaBall {
	constructor(x, y, radius, ySpeed) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.ySpeed = ySpeed;
	}
	update(partialFrames) {
		this.x -= Sinewave.WAVE_SPEED * partialFrames;
		this.y += this.ySpeed * partialFrames;
		this.radius *= 0.95 ** partialFrames;
	}
}

const METABALL_LIMIT = 8192;
let metaballs = [];
let removalQueue = [];
export function updateAndDraw(partialFrames) {
	removalQueue.length = 0;
	
	const width = GL.canvas.width;
	const middle = GL.canvas.height * 0.35;
	for(let i = 0; (i < 8) && (metaballs.length < METABALL_LIMIT); i++) {
		const radius = Math.random() * 32 + 64;
        const speed  = Math.random() * 4 + 6;
		
		const x = Math.random();
		const offset = Math.sin(x * Sinewave.WAVE_PERIOD + Sinewave.wavePhase) * Sinewave.WAVE_AMPLITUDE;
		const y =  offset + middle - radius;
		
		metaballs.push(new MetaBall(x * width, y, radius, speed));
	}
	
	glContext.useProgram(ballShader);
	glContext.bindBuffer(glContext.ARRAY_BUFFER, circleVBO);
	glContext.enableVertexAttribArray(ballPositionAttribLocation);
	glContext.vertexAttribPointer(ballPositionAttribLocation, 2, glContext.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	
	glContext.uniform2fv(ballResolutionUniformLocation, [GL.canvas.width, GL.canvas.height]);
	
	for(const [index, ball] of metaballs.entries()) {
		if(ball === undefined) { removalQueue.push(index); continue; }
		ball.update(partialFrames);
		
		if(ball.radius === Infinity || ball.radius <= 1 || ball.y <= (-ball.radius)) {
			removalQueue.push(index);
			continue;
		}
		
		glContext.uniform2fv(ballOffsetUniformLocation, [ball.x, ball.y]);
		glContext.uniform1f (ballRadiusUniformLocation, ball.radius);
		glContext.drawArrays(glContext.TRIANGLES, 0, 3);
	}
	for(let i = removalQueue.length - 1; i >= 0; i--) metaballs.splice(1, removalQueue[i]);
}