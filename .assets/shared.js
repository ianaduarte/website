import * as Background from "./background/main.js";

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

let lastFrame = 0;

function drawFrame(currentFrame) {
	const frameDelta = currentFrame - lastFrame;
	const partialFrames = frameDelta / 60;
	
	Background.drawBackground(partialFrames);
	
	lastFrame = currentFrame;
	requestAnimationFrame(drawFrame);
}
requestAnimationFrame(drawFrame);