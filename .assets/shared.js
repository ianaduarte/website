const tabs = document.querySelectorAll('.tab');
const animationDuration = 300;

function updateDepths(activeIndex) {
	const totalTabs = tabs.length;
	
	tabs.forEach((t, i) => {
		let newZIndex = (i === activeIndex)
			? totalTabs + 5
			: totalTabs - Math.abs(i - activeIndex);
		
		t.style.zIndex = `${newZIndex}`;
	});
}

let initialActiveIndex = -1;
tabs.forEach((t, i) => {
		switch(i + 1) {
			case 1: {
				t.style.setProperty("--rflare-height", "50.5px")
				break;
			}
			case tabs.length: {
				t.style.setProperty("--lflare-height", "50.5px")
				break;
			}
			default: {
				t.style.setProperty("--rflare-height", "50.5px")
				t.style.setProperty("--lflare-height", "50.5px")
				break;
			}
		}
		t.style.width = `calc((52rem + 4px) / ${tabs.length})`;
		
		if(t.classList.contains('active')) initialActiveIndex = i;
	}
);
updateDepths(initialActiveIndex !== -1? initialActiveIndex : 0);

tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
        event.preventDefault(); 
        event.stopPropagation();
		
        tabs.forEach(t => t.classList.remove('active'));
        
        tab.classList.add('active');
        updateDepths(index);
        
        const targetUrl = tab.getAttribute('data-url');
        const pageContent = document.getElementById("content");
        const loader = document.createElement("div");
        loader.classList.add("loader");
        pageContent.replaceChildren(loader);

        if(targetUrl) setTimeout(() => { window.location.href = targetUrl; }, animationDuration);
    });
});


class Bubble {
	constructor(x, y, radius, speed) {
		this.x = x;
		this.y = y;
		this.initialRadius = radius;
		this.radius = radius;
		this.speed = speed;
	}
	
	update(delta) {
		this.x -= 1.2;
		this.y -= this.speed * delta;
		this.radius *= 0.60 ** delta;
	}
	draw(ctx) {
		ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        
        const grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
        grad.addColorStop(0, `rgba(0, 0, 0, ${this.radius / this.initialRadius})`);
        grad.addColorStop(1, '#00000000');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.closePath();
	}
}
const mainCanvas = document.getElementById("main-canvas");
const backCanvas = document.getElementById("back-canvas");
const mainCtx = mainCanvas.getContext("2d");
const backCtx = backCanvas.getContext("2d");
mainCanvas.width  = backCanvas.width  = window.innerWidth;
mainCanvas.height = backCanvas.height = window.innerHeight;

let bubbles = [];
let lastFrame = Date.now();

window.addEventListener("resize", () => {
	mainCanvas.width  = backCanvas.width  = window.innerWidth;
	mainCanvas.height = backCanvas.height = window.innerHeight;
	bubbles.length = 0;
});

const amplitude = 50; 
const frequency = 0.0075; 
let phase = 0;

function sampleWave(x) {
    return Math.sin(x * frequency + phase) * amplitude;
}

function drawSine(ctx, width, height, delta) {
	phase += 0.6 * delta;
	const center = height / 2;
	ctx.fillStyle = 'black';
	
	ctx.beginPath();
	ctx.moveTo(0, height); 
	
	let yStart = sampleWave(0);
	ctx.lineTo(0, yStart + center);
	
	for(let x = 1; x < width; x++) {
		const y = sampleWave(x);
		ctx.lineTo(x, y + center);
	}
	
	let yEnd = sampleWave(width);
	ctx.lineTo(width, yEnd + center);
	ctx.lineTo(width, height); 
	ctx.fill();
	ctx.closePath(); 
}

function drawFrame(currentFrame) {
	let delta = (currentFrame - lastFrame) * 1e-3;
	
	if(bubbles.length < 2048) {
		const radius = Math.random() * 48 + 64;
		const x = Math.random() * backCanvas.width;
		const y = sampleWave(x) + backCanvas.height / 2 + radius;
        const speed  = Math.random() * 24 + 32;
		bubbles.push(new Bubble(x, y, radius, speed));
	}
	
	backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
	drawSine(backCtx, backCanvas.width, backCanvas.height, delta);
	
	let newBubbles = [];
	for(const bubble of bubbles) {
        bubble.update(delta);
		if(bubble === undefined) continue;
		if(bubble.radius === Infinity) continue;
        
        if(bubble.radius <= 1 || bubble.y < (-bubble.radius)) continue;
        
        bubble.draw(backCtx);
        newBubbles.push(bubble);
    }
	bubbles = newBubbles;
	
	let imageData = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
	let pixels = imageData.data;

	const n = pixels.length;
    for(let i = 0; i < n; i += 4) {
        if(pixels[i + 3] < 24) {
            pixels[i + 3] = 0;
        } else {
            pixels[i    ] = 0xEA;
            pixels[i + 1] = 0xB7;
            pixels[i + 2] = 0xB3;
            pixels[i + 3] = 0xFF;
        }
    }
	mainCtx.putImageData(imageData, 0, 0);
	
	lastFrame = currentFrame;
	requestAnimationFrame(drawFrame);
}
requestAnimationFrame(drawFrame);