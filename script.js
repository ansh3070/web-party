// Create floating hearts background
function createFloatingHearts() {
    const floatingHeartsContainer = document.querySelector('.floating-hearts');
    const heartCount = 20;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.fontSize = `${20 + Math.random() * 30}px`;
        heart.style.animationDuration = `${15 + Math.random() * 15}s`;
        heart.style.animationDelay = `${Math.random() * 10}s`;
        floatingHeartsContainer.appendChild(heart);
    }
}

// Heart burst animation
function triggerHeartBurst() {
    const burstContainer = document.getElementById('heartBurst');
    burstContainer.style.display = 'block';
    burstContainer.innerHTML = '';
    
    for (let i = 0; i < 30; i++) {
        const heart = document.createElement('div');
        heart.className = 'burst-heart';
        heart.innerHTML = '❤️';
        heart.style.left = '50%';
        heart.style.top = '50%';
        heart.style.fontSize = `${10 + Math.random() * 20}px`;
        heart.style.setProperty('--tx', `${(Math.random() * 200) - 100}px`);
        heart.style.setProperty('--ty', `${(Math.random() * 200) - 100}px`);
        burstContainer.appendChild(heart);
    }
    
    setTimeout(() => {
        burstContainer.style.display = 'none';
    }, 1000);
}

// Initialize Firebase
function initializeFirebase() {
    // EXAMPLE Firebase Config - REPLACE WITH YOUR OWN
    const firebaseConfig = {
        apiKey: "AIzaSyBArwbrvZveKpaIEMYCSyuxZl9TVFrTJzk",
        authDomain: "webparty-1282.firebaseapp.com",
        databaseURL: "https://webparty-1282-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "webparty-1282",
        storageBucket: "webparty-1282.firebasestorage.app",
        messagingSenderId: "739652457716",
        appId: "1:739652457716:web:97fe02df45a571023cfaa1",
        measurementId: "G-6E76Q6EM3M"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    return firebase.database();
}






// Main function
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const video = document.getElementById('videoPlayer');
    const chatPanel = document.getElementById('chatPanel');
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const backBtn = document.getElementById('backBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const heartBtn = document.getElementById('heartBtn');
    const watchingStatus = document.getElementById('watchingStatus');
    const container = document.querySelector('.container');
    const emojiToggleBtn = document.getElementById('emojiToggleBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const tempMessageDisplay = document.getElementById('tempMessageDisplay');
    
    // Create floating hearts
    createFloatingHearts();
    
    // Flag to prevent Firebase event loops
    let isLocalUpdate = false;
    let lastUpdateTime = 0;
    const UPDATE_DEBOUNCE = 500; // ms
    
    // Initialize Firebase
    let db;
    try {
        // Check if firebase is available
        if (typeof firebase !== 'undefined') {
            db = initializeFirebase();
            
            // Anonymous Authentication
            firebase.auth().signInAnonymously().catch((error) => {
                console.error("Auth Error:", error);
            });
            
            console.log("Firebase initialized successfully");
        } else {
            console.error("Firebase SDK is not loaded.");
        }
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
    
    // Toggle chat panel
    chatToggleBtn.addEventListener('click', () => {
        chatPanel.classList.add('open');
        // Focus on input when chat is opened
        setTimeout(() => {
            chatInput.focus();
        }, 300);
    });
    
    // Make sure the back button is visible and working
    console.log("Back button exists:", !!backBtn);
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log("Back button clicked");
            chatPanel.classList.remove('open');
        });
    }
    
    // Heart animation
    heartBtn.addEventListener('click', triggerHeartBurst);
    
    // Fullscreen toggle with clean UI
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => {
                container.classList.add('fullscreen');
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                
                // Add hide-in-fullscreen class to elements that should be hidden
                document.querySelectorAll('.hide-in-fullscreen').forEach(el => {
                    el.style.display = 'none';
                });
                
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                container.classList.remove('fullscreen');
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                
                // Remove hide-in-fullscreen class from elements
                document.querySelectorAll('.hide-in-fullscreen').forEach(el => {
                    el.style.display = '';
                });
                
            }).catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    });
    
    // Function to update Firebase with debounce
    function updateFirebase(action, time) {
        if (!db) return;
        
        const now = Date.now();
        if (now - lastUpdateTime < UPDATE_DEBOUNCE) {
            console.log("Debouncing Firebase update");
            return;
        }
        
        lastUpdateTime = now;
        isLocalUpdate = true;
        console.log(`Sending ${action} event to Firebase at time ${time}`);
        db.ref("videoState").set({ action, time, timestamp: now });
        
        // Reset the flag after a short delay
        setTimeout(() => {
            isLocalUpdate = false;
        }, 100);
    }
    
    // Video status
    video.addEventListener('play', () => {
        watchingStatus.textContent = 'Watching together ❤️';
        if (!isLocalUpdate) {
            updateFirebase("play", video.currentTime);
        }
    });
    
    video.addEventListener('pause', () => {
        watchingStatus.textContent = 'Paused - Take a moment to chat ✨';
        if (!isLocalUpdate) {
            updateFirebase("pause", video.currentTime);
        }
    });
    
    video.addEventListener('seeked', () => {
        if (!isLocalUpdate) {
            updateFirebase("seek", video.currentTime);
        }
    });
    
    // Send chat messages
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            if (db) {
                db.ref("chat").push({
                    text: message,
                    timestamp: Date.now()
                });
            } else {
                // Fallback for when Firebase is not available
                addMessageToChat(message, Date.now());
            }
            chatInput.value = '';
        }
    }
    
    sendBtn.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add message to chat
    function addMessageToChat(text, timestamp) {
        // Remove empty chat message if present
        const emptyChat = chatBox.querySelector('.empty-chat');
        if (emptyChat) {
            emptyChat.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageElement.appendChild(messageText);
        messageElement.appendChild(messageTime);
        chatBox.appendChild(messageElement);
        
        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        // Show temporary message if chat is closed
        if (!chatPanel.classList.contains('open')) {
            showTempMessage(text);
        }
    }

    // Show temporary message
    function showTempMessage(text) {
        tempMessageDisplay.textContent = text;
        tempMessageDisplay.style.display = 'block';
        
        // Clear any existing timeout
        if (window.tempMessageTimeout) {
            clearTimeout(window.tempMessageTimeout);
        }
        
        window.tempMessageTimeout = setTimeout(() => {
            tempMessageDisplay.style.display = 'none';
        }, 4000);
    }
    
    // Load chat messages from Firebase
    if (db) {
        db.ref("chat").on("child_added", (snapshot) => {
            const data = snapshot.val();
            addMessageToChat(data.text, data.timestamp);
        });
        
        // Sync video playback with improved handling to prevent loops
        db.ref("videoState").on("value", (snapshot) => {
            if (snapshot.exists() && !isLocalUpdate) {
                const data = snapshot.val();
                const now = Date.now();
                
                // Ignore old events (more than 10 seconds old)
                if (data.timestamp && now - data.timestamp > 10000) {
                    console.log("Ignoring old Firebase event");
                    return;
                }
                
                console.log(`Received ${data.action} event from Firebase at time ${data.time}`);
                
                // Set the flag to prevent event loops
                isLocalUpdate = true;
                
                // Apply the video state change
                if (data.action === "play") {
                    // Only update time if it's significantly different
                    if (Math.abs(video.currentTime - data.time) > 1) {
                        video.currentTime = data.time;
                    }
                    
                    // Play the video
                    video.play().catch(e => console.error("Error playing video:", e));
                } else if (data.action === "pause") {
                    // Only update time if it's significantly different
                    if (Math.abs(video.currentTime - data.time) > 1) {
                        video.currentTime = data.time;
                    }
                    
                    // Pause the video
                    video.pause();
                } else if (data.action === "seek") {
                    video.currentTime = data.time;
                }
                
                // Reset the flag after a short delay
                setTimeout(() => {
                    isLocalUpdate = false;
                }, 1000);
            }
        });
    }

    // Emoji picker
    const emojis = [
        '😊', '😂', '😍', '🥰', '😘', '😎', '🤔', '😮', '😢', '😡', 
        '👍', '👎', '👏', '🙌', '🤝', '🤗', '🎉', '🎊', '🎈', '🎁', 
        '❤️', '💔', '💖', '💘', '💝', '💯', '🔥', '💩', '🍿', '🍕', 
        '🍔', '🌟', '🌈', '🌸', '🌺', '🌼', '😴', '🥺', '😋', '🤣',
        '💕', '💓', '💞', '💗', '💋', '👀', '🙄', '😉', '😌', '😜'
    ];

    emojis.forEach(emoji => {
        const emojiElement = document.createElement('span');
        emojiElement.className = 'emoji-item';
        emojiElement.textContent = emoji;
        emojiElement.addEventListener('click', () => {
            chatInput.value += emoji;
            chatInput.focus();
        });
        emojiPicker.appendChild(emojiElement);
    });

    emojiToggleBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle('open');
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiToggleBtn) {
            emojiPicker.classList.remove('open');
        }
    });
    
    // Fix for mobile devices - ensure chat input is visible
    function checkChatInputVisibility() {
        if (chatPanel.classList.contains('open')) {
            // Ensure the chat input is visible
            chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Check visibility when chat is opened and when device orientation changes
    chatToggleBtn.addEventListener('click', () => {
        setTimeout(checkChatInputVisibility, 500);
    });
    
    window.addEventListener('resize', checkChatInputVisibility);
    window.addEventListener('orientationchange', checkChatInputVisibility);
    
    // Debug info for mobile
    console.log("Window dimensions:", window.innerWidth, "x", window.innerHeight);
    console.log("Chat input exists:", !!chatInput);
});


video.addEventListener('play', () => {
    firebase.database().ref('videoState').set({
        action: 'play',
        time: video.currentTime
    });
});

video.addEventListener('pause', () => {
    firebase.database().ref('videoState').set({
        action: 'pause',
        time: video.currentTime
    });
});

// Listen for changes from Firebase
firebase.database().ref('videoState').on('value', (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();

    if (data.action === 'play') {
        video.currentTime = data.time;
        video.play();
    } else if (data.action === 'pause') {
        video.currentTime = data.time;
        video.pause();
    }
});
