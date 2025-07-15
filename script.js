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

const typingRef = firebase.database().ref('typing');
// Reference for online users
const usersRef = firebase.database().ref('users');

const typingNotificationArea = document.getElementById("typing-notification");
const backgroundMusicPlayer = document.getElementById("background-music-player");
const musicSelector = document.getElementById("music-selector");
// New audio element for join sound
const joinSound = new Audio('sound/buddyin.mp3');

let typingTimeout;
let messageSendTimeout;

// Set user as online and handle disconnect
const userOnlineRef = usersRef.child(username);
userOnlineRef.set(true); // Set user as online when they join
userOnlineRef.onDisconnect().remove(); // Remove user from 'users' when they disconnect

// Listen for new users joining
usersRef.on('child_added', function(snapshot) {
    const joinedUsername = snapshot.key;
    if (joinedUsername !== username) { // Don't notify for self-join
        const timestamp = Date.now();
        db.ref("messages/" + timestamp).set({
            msg: `<span style="color:green">${joinedUsername} joined the chat</span>`
        });
        joinSound.play().catch(e => console.error("Failed to play join sound:", e));
    }
});


document.getElementById("chat-txt").addEventListener("input", () => {
    typingRef.child(username).set(true);

    clearTimeout(typingTimeout);
    clearTimeout(messageSendTimeout);

    typingTimeout = setTimeout(() => {
        typingRef.child(username).remove();
    }, 3000);

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
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:blue;">$1</a>');

    if (message.trim() === "") {
        updateTypingNotificationDisplay();
        return;
    }

    if (message === "!help") {
        db.ref("messages/" + timestamp).set({
            usr: "sYs (bot)",
            msg: "<i style='color:gray'>someone used the !help command</i> Hi, I'm sYs"
        });
    } else {
        db.ref("messages/" + timestamp).set({
            usr: coloredUsernameHtml,
            msg: formattedMessage,
        });
    }

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
