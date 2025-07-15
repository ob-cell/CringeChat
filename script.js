const firebaseConfig = {
  apiKey: "AIzaSyAcyqPpPq0dXLez3MINPXfYvy6LnOCkbPM",
  authDomain: "cringechat-cc04f.firebaseapp.com",
  databaseURL: "https://cringechat-cc04f-default-rtdb.firebaseio.com",
  projectId: "cringechat-cc04f",
  storageBucket: "cringechat-cc04f.appspot.com",
  messagingSenderId: "1078798953034",
  appId: "1:1078798953034:web:78081799548359f3e294b3",
  measurementId: "G-FGHETW90V3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const usernames = new Set();
const typingUsers = new Set();

let username = localStorage.getItem('username');
while (!username || username.trim() === "") {
    username = prompt("What's your username oomf?");
    if (username) {
        username = username.trim();
    }
}
localStorage.setItem('username', username);

let randomColor = localStorage.getItem('coloredUsername');
if (!randomColor) {
    randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    localStorage.setItem('coloredUsername', randomColor);
}
const coloredUsernameHtml = `<span style="color:${randomColor}">${username}</span>`;

const connectedRef = firebase.database().ref('.info/connected');
const presenceRef = firebase.database().ref('presence');
const typingRef = firebase.database().ref('typing');

const onlineUsersDisplay = document.getElementById('online-users');
const typingNotificationArea = document.getElementById("typing-notification");
const backgroundMusicPlayer = document.getElementById("background-music-player");
const musicSelector = document.getElementById("music-selector");


let typingTimeout;
let messageSendTimeout;

connectedRef.on('value', function(snapshot) {
    if (snapshot.val() === true) {
        const userRef = presenceRef.child(username);
        userRef.onDisconnect().remove();
        userRef.set(true);
    }
});

presenceRef.on('value', function(snapshot) {
    const onlineCount = snapshot.numChildren();
    onlineUsersDisplay.textContent = `Online: ${onlineCount}`;
});

document.getElementById("chat-txt").addEventListener("input", () => {
    typingRef.child(username).set(true);

    clearTimeout(typingTimeout);
    clearTimeout(messageSendTimeout);

    typingTimeout = setTimeout(() => {
        typingRef.child(username).remove();
    }, 3000); // Typing notification goes away after 3 seconds of inactivity

    messageSendTimeout = setTimeout(() => {
        const chatTxtElement = document.getElementById("chat-txt");
        if (chatTxtElement.value.trim() !== "") {
            postChat({ preventDefault: () => {} });
        }
    }, 10000);
});

typingRef.on('child_added', function(snapshot) {
    const typingUsername = snapshot.key;
    if (typingUsername !== username) {
        typingUsers.add(typingUsername);
    }
    updateTypingNotificationDisplay();
});

typingRef.on('child_removed', function(snapshot) {
    const typingUsername = snapshot.key;
    typingUsers.delete(typingUsername);
    updateTypingNotificationDisplay();
});

function updateTypingNotificationDisplay() {
    if (typingUsers.size === 0) {
        typingNotificationArea.innerHTML = "";
    } else if (typingUsers.size === 1) {
        typingNotificationArea.innerHTML = `<small>${Array.from(typingUsers)[0]} is typing...</small>`;
    } else {
        const usersArray = Array.from(typingUsers);
        const lastUser = usersArray.pop();
        if (usersArray.length === 0) {
             typingNotificationArea.innerHTML = `<small>${lastUser} is typing...</small>`;
        } else {
            typingNotificationArea.innerHTML = `<small>${usersArray.join(', ')} and ${lastUser} are typing...</small>`;
        }
    }
}

document.getElementById("send-message").addEventListener("submit", postChat);

function postChat(e) {
    e.preventDefault();

    clearTimeout(typingTimeout);
    clearTimeout(messageSendTimeout);

    const timestamp = Date.now();
    const chatTxt = document.getElementById("chat-txt");
    const message = chatTxt.value;
    chatTxt.value = "";

    typingRef.child(username).remove();

    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/:(\w+):/g, (match, emojiName) => {
            const emojiMap = {
                heart: "❤️",
                smile: "😊",
                thumbs_up: "👍",
                skull: "☠️",
                skull_2: "💀",
            };
            return emojiMap[emojiName] || match;
        })
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:blue;">$1</a>');

    const customEmojiMap = {
        "=\)": "emojis/smiley.gif",
        ":smiley:": "emojis/smiley.gif",
    };

    for (const textEmoji in customEmojiMap) {
        const imageUrl = customEmojiMap[textEmoji];
        const imageTag = `<img src="${imageUrl}" class="custom-emoji-img" alt="${textEmoji.replace(/[-\/\\^$*+?.()|[\]{}]/g, '')}">`;
        const regex = new RegExp(textEmoji.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        formattedMessage = formattedMessage.replace(regex, imageTag);
    }

    if (message.trim() === "") { // Don't send empty messages
        updateTypingNotificationDisplay(); // Update typing display in case message was empty
        return;
    }

    if (message === "!help") {
        db.ref("messages/" + timestamp).set({
            usr: "sYs (bot)",
            msg: "<i style='color:gray'>someone used the !help command</i> Hi, I'm sYs"
        }).then(() => {
            // Optional: You could directly append the message here for immediate local display
            // but relying on the 'child_added' listener is generally more consistent.
        }).catch(error => {
            console.error("Error sending help message:", error);
        });
    } else {
        db.ref("messages/" + timestamp).set({
            usr: coloredUsernameHtml,
            msg: formattedMessage,
        }).then(() => {
            // Optional: You could directly append the message here for immediate local display
            // but relying on the 'child_added' listener is generally more consistent.
        }).catch(error => {
            console.error("Error sending user message:", error);
        });
    }

    usernames.clear(); // Keep this for whatever local purpose it serves
    updateTypingNotificationDisplay();
    scrollToBottom();
}

const fetchChat = db.ref("messages/");
fetchChat.on("child_added", function (snapshot) {
    const messages = snapshot.val();
    const msg = `<li>${messages.usr} : ${messages.msg}</li>`;
    document.getElementById("messages").innerHTML += msg;
    scrollToBottom();
});

function scrollToBottom() {
    const chatBox = document.querySelector(".chat");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function loadAndPlaySelectedMusic() {
    const selectedSong = musicSelector.value;
    if (selectedSong) {
        backgroundMusicPlayer.src = selectedSong;
        backgroundMusicPlayer.load();
        playCurrentMusic();
    } else {
        backgroundMusicPlayer.pause();
        backgroundMusicPlayer.src = "";
    }
}

function playCurrentMusic() {
    if (backgroundMusicPlayer.src) {
        backgroundMusicPlayer.volume = 0.1;
        backgroundMusicPlayer.play().catch(e => console.error("Failed to play music:", e));
    }
}

function pauseCurrentMusic() {
    backgroundMusicPlayer.pause();
}

function stopCurrentMusic() {
    backgroundMusicPlayer.pause();
    backgroundMusicPlayer.currentTime = 0;
}

function play() {
  var audio = document.getElementById("audio");
  audio.play();
          }
