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
// Maximum file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;


// Send photo
function sendPhoto(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Photo must be less than 5 MB.");
        event.target.value = "";
        return;
    }

    sendFile(file);

    event.target.value = "";
}


// Send document
function sendDocument(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Document must be less than 5 MB.");
        event.target.value = "";
        return;
    }

    sendFile(file);

    event.target.value = "";
}


// Convert file into encrypted data and send
function sendFile(file) {

    const reader = new FileReader();

    reader.onload = function () {

        // File data
        const fileData = reader.result;

        // Encrypt file data
        const encryptedFile = encryptMessage(fileData);

        // Send encrypted file through Socket.IO
        socket.emit("chat message", {

            username: username,

            message: encryptedFile,

            type: "file",

            fileName: file.name,

            fileType: file.type,

            time: new Date().toLocaleTimeString()
        });
    };

    reader.readAsDataURL(file);
}


// Receive text messages, photos and documents
socket.on("chat message", (data) => {

    const messages = document.getElementById("messages");

    const decryptedMessage = decryptMessage(data.message);

    const messageDiv = document.createElement("div");

    messageDiv.className = "message";


    // =========================
    // PHOTO OR DOCUMENT
    // =========================

    if (data.type === "file") {

        messageDiv.innerHTML = `
            <strong>${escapeHTML(data.username)}</strong>
            <small>${escapeHTML(data.time)}</small>
        `;


        // If the received file is a photo
        if (data.fileType && data.fileType.startsWith("image/")) {

            const image = document.createElement("img");

            image.src = decryptedMessage;

            image.alt = data.fileName;

            image.style.maxWidth = "300px";

            image.style.maxHeight = "300px";

            image.style.display = "block";

            image.style.marginTop = "10px";

            image.style.borderRadius = "10px";

            messageDiv.appendChild(image);
        }


        // Download button
        const downloadLink = document.createElement("a");

        downloadLink.href = decryptedMessage;

        downloadLink.download = data.fileName;

        downloadLink.innerText =
            "📥 Download " + data.fileName;

        downloadLink.style.display = "inline-block";

        downloadLink.style.marginTop = "10px";

        messageDiv.appendChild(downloadLink);


        // Encryption information
        const encryptedText = document.createElement("div");

        encryptedText.className = "encrypted";

        encryptedText.innerText =
            "🔒 File encrypted before transmission";

        messageDiv.appendChild(encryptedText);

    }


    // =========================
    // NORMAL TEXT MESSAGE
    // =========================

    else {

        messageDiv.innerHTML = `
            <strong>${escapeHTML(data.username)}</strong>

            <small>${escapeHTML(data.time)}</small>

            <p>${escapeHTML(decryptedMessage)}</p>

            <div class="encrypted">
                🔒 Message encrypted before transmission
            </div>
        `;
    }


    // Add message to chat
    messages.appendChild(messageDiv);

    // Scroll to latest message
    messages.scrollTop = messages.scrollHeight;

});