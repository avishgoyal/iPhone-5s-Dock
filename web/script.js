function postApp(e) {
    let appElement = e.currentTarget;
    let appName = appElement.id;
    fetch('/icon', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icon: appName }),
    }).then((response) => {
        console.log(response);
})};

const apps = document.querySelectorAll('.app');
apps.forEach((app) => {app.addEventListener('click', postApp)});

document.querySelectorAll('.icon').forEach((icon) => {
    icon.addEventListener('click', () => {
        icon.classList.add('disabled');
        setTimeout(() => {
            icon.classList.remove('disabled');
        }, 3000);   
    })});

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let isCurrentlyOffline = false;

// Check every 5 seconds. 
// This is safe now because 'reload' only fires when transitioning from Off -> On.
async function heartbeat() {
    // 1. Create a "Timer" to kill the request if it hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
        const response = await fetch('/', { 
            signal: controller.signal,
            cache: 'no-store' // Force the phone to actually check the network
        });

        if (response.ok && isCurrentlyOffline) {
            console.log("Server detected! Reloading...");
            window.location.reload();
        }
    } catch (error) {
        console.log("PC is still gone...");
        if (!isCurrentlyOffline) {
            isCurrentlyOffline = true;
            showOfflineUI();
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

function showOfflineUI() {
    // Only build the overlay if it doesn't exist
    if (document.getElementById('offline-msg')) return;

    const div = document.createElement('div');
    div.id = 'offline-msg';
    div.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:white;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;";
    div.innerHTML = `
        <div style="padding:20px; border:1px solid #444; border-radius:15px; background:#111;">
            <h2 style="color:#ff4444; margin:0;">PC OFFLINE</h2>
            <p style="opacity:0.6; font-size:12px;">Waiting for Python Server...</p>
        </div>
    `;
    document.body.appendChild(div);
}


setInterval(heartbeat, 5000);

let dots = document.querySelectorAll('.dot');
const scroll = document.querySelector('.snap-container');
scroll.addEventListener('scroll', () => {
    const index = Math.round(scroll.scrollLeft / scroll.clientWidth);
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
})

let clockElement = document.querySelector('#clock');
function updateClock() {
    clockElement.innerHTML = new Date().toLocaleTimeString([], {hour12: true,hour: '2-digit', minute:'2-digit'});   
}
updateClock();
setInterval(updateClock, 30000);


let currentStream = null;

function initWebcam() {
    const video = document.getElementById('webcam'); 
    const constraints = { video: {
        width: 320,
        height: 240,
        facingMode: "user"
    }
    }
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            currentStream = stream
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.muted = true; // Mute the video to avoid feedback
                video.play();
                startStreaming(video);
            };
        }).catch((error) => {
        console.error("Error accessing webcam: ", error);
    })};
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Browser says: Camera API not supported in Standalone!");
        return;
    }
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

let socket;
const statusDot = document.getElementById('status-dot');
function connectSocket() {
    socket = new WebSocket("wss://192.168.1.153:8001");


    socket.binaryType = "blob";
    socket.onopen = () => {
        console.log("WebSocket connection established");
        console.log("WS Connected!");
    };
    socket.onerror = (error) => {
        console.log("WebSocket Error: Check if port 8001 is open on your PC!");
        console.error("WebSocket error: ", error);
    }

    socket.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting in 3 seconds...");
        setTimeout(connectSocket, 3000);
    }
}

let lastFrameTime = 0;
const fpsLimit = 15;
const frameInterval = 1000 / fpsLimit; // ~41.6ms
let animationFrameId = null;

function startStreaming(video) {
    if (!socket || socket.readyState !== WebSocket.OPEN) { return; }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const sendFrame = (now) => {
        if (!webcam_state) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        if (now - lastFrameTime > frameInterval) {
            if (socket.readyState === WebSocket.OPEN) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) socket.send(blob);
                }, 'image/jpeg', 0.5);
            }
            lastFrameTime = now;
        }
        animationFrameId = requestAnimationFrame(sendFrame);
    };
    animationFrameId = requestAnimationFrame(sendFrame);
}

function stopWebcam() {
    const video = document.getElementById('webcam');

    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    if (video) {
        video.srcObject = null;
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    console.log("Camera stream stopped")
}

let webcam_state = false;
const webcam_button = document.getElementById('webcam-button');
webcam_button.addEventListener('click', () => {
    webcam_state = !webcam_state;
    if (webcam_state) {
        initWebcam();
        statusDot.classList.add('connected');
    }
    else if (!webcam_state) {
        stopWebcam();
        statusDot.classList.remove('connected');
}});

connectSocket();

document.addEventListener('click', function() {
    const video = document.getElementById('webcam');
    if (video.paused) {
        video.play();
        console.log("Video unpaused via user tap");
    }
}, { once: true });

document.addEventListener('click', function(e) {
    // Check if the click happened in the bottom 30px
    if (e.clientX < 30 || e.clientX > (window.innerWidth - 30)) {
    // This blocks the short edges (charging port/top) instead of the bottom
    e.stopPropagation();
    e.preventDefault();
    }
}, true); // Use 'true' for the capture phase to stop it before it reaches icons