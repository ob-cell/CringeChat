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

const username = prompt("What's your username oomf?");

document.getElementById("send-message").addEventListener("submit", postChat); function postChat(e) 
{ e.preventDefault();
const timestamp = Date.now(); 
const chatTxt = document.getElementById("chat-txt");
const message = chatTxt.value; chatTxt.value = ""; 
db.ref("messages/" + timestamp).set({ 
  usr: username,
  msg: message, 
  
}); 
}
const fetchChat = db.ref("messages/"); 
fetchChat.on("child_added", function (snapshot) { const messages = snapshot.val(); 
const msg = "<li>" + messages.usr + " : " + messages.msg + "</li>";
document.getElementById("messages").innerHTML += msg; });

