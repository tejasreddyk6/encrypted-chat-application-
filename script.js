const socket = io();

let username = "";
let secretKey = "";

function joinChat() {

    username = document.getElementById("username").value.trim();
    secretKey = document.getElementById("secretKey").value;

    if (username === "") {
        alert("Please enter your name.");
        return;
    }

    if (secretKey.length < 4) {
        alert("Secret key must contain at least 4 characters.");
        return;
    }

    document.getElementById("loginBox").style.display = "none";

    document.getElementById("chatContainer").style.display = "block";

    document.getElementById("welcome").innerText =
        "Welcome, " + username + " 🔐";
}


function encryptMessage(message) {

    return CryptoJS.AES.encrypt(
        message,
        secretKey
    ).toString();

}


function decryptMessage(encryptedMessage) {

    try {

        const bytes = CryptoJS.AES.decrypt(
            encryptedMessage,
            secretKey
        );

        return bytes.toString(CryptoJS.enc.Utf8);

    } catch (error) {

        return "Unable to decrypt message";

    }

}


function sendMessage() {

    const input = document.getElementById("messageInput");

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    const encryptedMessage = encryptMessage(message);

    socket.emit("chat message", {

        username: username,

        message: encryptedMessage,

        time: new Date().toLocaleTimeString()

    });

    input.value = "";

}

socket.on("chat message", (data) => {

    const messages = document.getElementById("messages");

    const decryptedMessage = decryptMessage(data.message);

    const messageDiv = document.createElement("div");

    messageDiv.className = "message";

    messageDiv.innerHTML = `

        <strong>${escapeHTML(data.username)}</strong>

        <small>
            ${escapeHTML(data.time)}
        </small>

        <p>
            ${escapeHTML(decryptedMessage)}
        </p>

        <div class="encrypted">
            🔒 Message encrypted before transmission
        </div>

    `;

    messages.appendChild(messageDiv);

    messages.scrollTop = messages.scrollHeight;

});


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function handleEnter(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

}


function logout() {

    username = "";
    secretKey = "";

    document.getElementById("chatContainer").style.display = "none";

    document.getElementById("loginBox").style.display = "block";

    document.getElementById("username").value = "";

    document.getElementById("secretKey").value = "";

    document.getElementById("messages").innerHTML = "";

}