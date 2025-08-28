let heartsInterval;
let activeHearts = [];

function startHeartsAnimation() {
    clearInterval(heartsInterval);
    
    activeHearts.forEach(heart => {
        if (heart.element && document.body.contains(heart.element)) {
            heart.element.remove();
            clearTimeout(heart.timeout);
        }
    });
    activeHearts = [];
    
    const heartContainer = document.getElementById("floating-hearts");
    
    heartsInterval = setInterval(() => {
        const heart = document.createElement("div");
        const heartTypes = ["❤️", "💖", "💗", "💓", "💘", "💝", "💕", "💞"];
        const randomHeart = heartTypes[Math.floor(Math.random() * heartTypes.length)];
        
        heart.innerHTML = randomHeart;
        heart.style.position = "absolute";
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${Math.random() * 25 + 15}px`;
        heart.style.opacity = Math.random() * 0.6 + 0.4;
        heart.style.animationDuration = `${Math.random() * 4 + 3}s`;
        heart.style.top = "100vh";
        heart.style.zIndex = "1";
        heart.style.textShadow = "0 0 15px rgba(255, 107, 107, 0.7)";
        
        heartContainer.appendChild(heart);
        
        void heart.offsetWidth;
        
        heart.style.top = "-50px";
        heart.style.transform = `translateY(-100vh) rotate(${Math.random() * 720 - 360}deg)`;
        
        const timeoutId = setTimeout(() => {
            heart.remove();
        }, 6000);
        
        const heartObj = {
            element: heart,
            timeout: timeoutId
        };
        activeHearts.push(heartObj);
        
        if (activeHearts.length > 50) {
            activeHearts = activeHearts.filter(h => document.body.contains(h.element));
        }
    }, 250);
}

// 停止爱心动画
function stopHeartsAnimation() {
    clearInterval(heartsInterval);
    activeHearts.forEach(heart => {
        if (heart.element && document.body.contains(heart.element)) {
            heart.element.remove();
            clearTimeout(heart.timeout);
        }
    });
    activeHearts = [];
}