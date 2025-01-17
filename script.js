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
const storedUsername = localStorage.getItem('username');
const storedColor = localStorage.getItem('coloredUsername');
const username = storedUsername ? storedUsername : prompt("What's your username oomf?");
localStorage.setItem('username', username);
const randomColor = storedColor ? storedColor : '#' + Math.floor(Math.random()*16777215).toString(16);
localStorage.setItem('coloredUsername', randomColor);
const coloredUsername = `<span style="color:${randomColor}">${username} (${randomColor})</span>`;

document.getElementById("send-message").addEventListener("submit", postChat); 
document.getElementById("chat-txt").addEventListener("input", () => {
  if (!usernames.has(username)) {
    usernames.add(username);
  }
  updateTypingNotification();
});

function postChat(e) { 
  e.preventDefault();
  const timestamp = Date.now(); 
  const chatTxt = document.getElementById("chat-txt");
  const message = chatTxt.value; 
  chatTxt.value = ""; 
  
  const formattedMessage = message
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

  if (message === "!help") {
    db.ref("messages/" + timestamp).set({ 
      usr: "sYs (bot)",
      msg: "<i style='color:gray'>someone used the !help command</i> Hi, I'm sYs" 
    });
  } else {
    db.ref("messages/" + timestamp).set({ 
      usr: coloredUsername,
      msg: formattedMessage, 
    }); 
  }

  usernames.clear();
  updateTypingNotification();
  scrollToBottom();
}

const fetchChat = db.ref("messages/"); 
fetchChat.on("child_added", function (snapshot) { 
  const messages = snapshot.val(); 
  const msg = "<li>" + messages.usr + " : " + messages.msg + "</li>";
  document.getElementById("messages").innerHTML += msg; 
  scrollToBottom();
});

function scrollToBottom() {
  const chatBox = document.querySelector(".chat");
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateTypingNotification() {
  const typingArea = document.getElementById("typing-notification");
  if (usernames.size === 0) {
    typingArea.innerHTML = "";
    return;
  }
  if (usernames.size === 1) {
    typingArea.innerHTML = `<small>${Array.from(usernames)[0]} is typing...</small>`;
  } else if (usernames.size === 2) {
    typingArea.innerHTML = `<small>${Array.from(usernames).join(", ")} are typing...</small>`;
  } else {
    typingArea.innerHTML = `<small>Several users are typing...</small>`;
  }
}
