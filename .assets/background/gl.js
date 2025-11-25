export const canvas = document.getElementById("main-canvas");
export const context = canvas.getContext("webgl2");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
context.viewport(0, 0, canvas.width, canvas.height);
context.enable(context.DEPTH_TEST);

export let mainTexture = context.createTexture();
export let mainFramebuffer = context.createFramebuffer();
context.bindTexture(context.TEXTURE_2D, mainTexture);
context.texStorage2D(context.TEXTURE_2D, 1, context.RGBA8, canvas.width, canvas.height);
context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);

context.bindFramebuffer(context.FRAMEBUFFER, mainFramebuffer);
context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, mainTexture, 0);


window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context.viewport(0, 0, canvas.width, canvas.height);
	
	context.deleteTexture(mainTexture);
	context.deleteFramebuffer(mainFramebuffer);
	
	mainTexture = context.createTexture();
	mainFramebuffer = context.createFramebuffer();
	context.bindTexture(context.TEXTURE_2D, mainTexture);
	context.texStorage2D(context.TEXTURE_2D, 1, context.RGBA8, canvas.width, canvas.height);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
	
	context.bindFramebuffer(context.FRAMEBUFFER, mainFramebuffer);
	context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, mainTexture, 0);
});

export function compileShaderPass(source, type) {
	const program = context.createShader(type);
	context.shaderSource(program, source);
	context.compileShader(program);
	
	if(!context.getShaderParameter(program, context.COMPILE_STATUS)) {
		const errorMessage = context.getShaderInfoLog(program);
		console.error(`failed to compile shader pass: ${errorMessage}`);
		
		return undefined;
	}
	
	return program;
}
export function compileShaderProgram(...passes) {
	const program = context.createProgram();
	
	for(const pass of passes) context.attachShader(program, pass);
	context.linkProgram(program);
	
	if(!context.getProgramParameter(program, context.LINK_STATUS)) {
		const errorMessage = context.getProgramInfoLog(program);
		console.error(`failed to link shader program: ${errorMessage}`);
		return undefined;
	}
	
	return program;
}

export function getAttribLocation(program, name) {
	const location = context.getAttribLocation(program, name);
	if(location < 0) {
		console.error(`failed to get attribute location for ${name}`);
		return undefined;
	}
	
	return location;
}
export function getUniformLocation(program, name) {
	const location = context.getUniformLocation(program, name);
	if(location < 0) {
		console.error(`failed to get uniform location for ${name}`);
		return undefined;
	}
	
	return location;
}

const quadVshSource = await fetch("/.assets/background/shaders/quad_vsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));
const blitFshSource = await fetch("/.assets/background/shaders/blit_fsh.glsl")
	.then((res) => res.text())
	.catch((e) => console.error(e));
export const QUAD_VERTEX_PASS = compileShaderPass(quadVshSource, context.VERTEX_SHADER);

export const BLIT_SHADER = compileShaderProgram(
	QUAD_VERTEX_PASS,
	compileShaderPass(blitFshSource, context.FRAGMENT_SHADER)
);