const tabs = document.querySelectorAll('.tab');
const animationDuration = 300;
tabs.forEach((t, i) => {
	if(!t.classList.contains('active')) t.style.zIndex = `${i}`;
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
});

tabs.forEach(tab => {
	tab.addEventListener('click', (event) => {
		event.preventDefault(); 
		event.stopPropagation();
		
		tabs.forEach((t, i) => {
			t.classList.remove('active');
			t.style.zIndex = `${i}`;
		});
		tab.classList.add('active');
		tab.style.zIndex = 10;
		const targetUrl = tab.getAttribute('data-url');
		const pageContent = document.getElementById("content");
		const loader = document.createElement("div");
		loader.classList.add("loader");
		pageContent.replaceChildren(loader);

		if(targetUrl) {
			setTimeout(() => { window.location.href = targetUrl; }, animationDuration);
		}
	});
});