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
            msg: "<i style='color:gray'>someone used the !help command</i>| Hi, I'm sYs"
        });
    } else {
        db.ref("messages/" + timestamp).set({
            usr: coloredUsernameHtml,
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
    const msg = `<li>${messages.usr} : ${messages.msg}</li>`;
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
const customEmojiMap = {

    "=)": "emojis/smiley.gif",
    
  };



  for (const textEmoji in customEmojiMap) {

    const imageUrl = customEmojiMap[textEmoji];

    const imageTag = `<img src="${imageUrl}" class="custom-emoji-img" alt="${textEmoji.replace(/:/g, '')}">`;

    // Use a RegExp to replace all occurrences of the textEmoji

    const regex = new RegExp(textEmoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); // Escape special characters

    formattedMessage = formattedMessage.replace(regex, imageTag);

  }

const typingRef = firebase.database().ref('typing');

let typingTimeout;



document.getElementById("chat-txt").addEventListener("input", () => {

    typingRef.child(username).set(true);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {

        typingRef.child(username).remove();

    }, 2000);

});



function postChat(e) {
  e.preventDefault();
  const timestamp = Date.now();
  const chatTxt = document.getElementById("chat-txt");
  const message = chatTxt.value;
  chatTxt.value = "";



  clearTimeout(typingTimeout);
  typingRef.child(username).remove();



  usernames.clear();
  updateTypingNotificationDisplay();
  scrollToBottom();

}



const typingRef = firebase.database().ref('typing');
let typingTimeout;
let messageSendTimeout;

document.getElementById("chat-txt").addEventListener("input", () => {
    typingRef.child(username).set(true);
    clearTimeout(typingTimeout);
    clearTimeout(messageSendTimeout);

    typingTimeout = setTimeout(() => {
        typingRef.child(username).remove();
    }, 2000);

    messageSendTimeout = setTimeout(() => {
        const chatTxtElement = document.getElementById("chat-txt");
        if (chatTxtElement.value.trim() !== "") {
            postChat({ preventDefault: () => {} });
        }
    }, 10000);
});

function postChat(e) {
  e.preventDefault();

  clearTimeout(typingTimeout);
  clearTimeout(messageSendTimeout);

  const chatTxt = document.getElementById("chat-txt");
  typingRef.child(username).remove();

  
  if (chatTxt.value.trim() !== "") {
      const timestamp = Date.now();
      db.ref("messages/" + timestamp).set({
          usr: coloredUsernameHtml,
          msg: chatTxt.value,
      });
      chatTxt.value = "";
      scrollToBottom();
  }

  updateTypingNotificationDisplay();
}

const typingUsers = new Set();
const typingNotificationArea = document.getElementById("typing-notification");

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
