// =====================================
// SOCKET.IO CONNECTION
// =====================================

const socket = io();


// =====================================
// USER VARIABLES
// =====================================

let username = "";
let secretKey = "";


// =====================================
// MAXIMUM FILE SIZE
// =====================================

const MAX_FILE_SIZE = 5 * 1024 * 1024;


// =====================================
// JOIN CHAT
// =====================================

function joinChat() {

    const usernameInput =
        document.getElementById("username");

    const secretKeyInput =
        document.getElementById("secretKey");

    username =
        usernameInput.value.trim();

    secretKey =
        secretKeyInput.value;

    if (username === "") {

        alert("Please enter your name.");

        return;
    }

    if (secretKey.length < 4) {

        alert(
            "Secret key must contain at least 4 characters."
        );

        return;
    }


    document.getElementById("loginBox").style.display =
        "none";

    document.getElementById("chatContainer").style.display =
        "flex";


    document.getElementById("welcome").innerText =
        username;


    document.getElementById("messageInput").focus();
}


// =====================================
// ENCRYPT MESSAGE
// =====================================

function encryptMessage(message) {

    return CryptoJS.AES.encrypt(
        message,
        secretKey
    ).toString();
}


// =====================================
// DECRYPT MESSAGE
// =====================================

function decryptMessage(encryptedMessage) {

    try {

        const bytes =
            CryptoJS.AES.decrypt(
                encryptedMessage,
                secretKey
            );

        const result =
            bytes.toString(
                CryptoJS.enc.Utf8
            );

        if (!result) {

            return "Unable to decrypt message";
        }

        return result;

    } catch (error) {

        console.error(
            "Decryption error:",
            error
        );

        return "Unable to decrypt message";
    }
}


// =====================================
// SEND TEXT MESSAGE
// =====================================

function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const message =
        input.value.trim();

    if (message === "") {

        return;
    }


    const encryptedMessage =
        encryptMessage(message);


    socket.emit(
        "chat message",
        {
            username: username,

            message: encryptedMessage,

            type: "text",

            time:
                new Date().toLocaleTimeString()
        }
    );


    input.value = "";

    input.focus();
}


// =====================================
// SEND PHOTO
// =====================================

function sendPhoto(event) {

    const file =
        event.target.files[0];

    if (!file) {

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        event.target.value = "";

        return;
    }


    if (file.size > MAX_FILE_SIZE) {

        alert(
            "Photo must be less than 5 MB."
        );

        event.target.value = "";

        return;
    }


    sendFile(file);


    event.target.value = "";
}


// =====================================
// SEND DOCUMENT
// =====================================

function sendDocument(event) {

    const file =
        event.target.files[0];

    if (!file) {

        return;
    }


    if (file.size > MAX_FILE_SIZE) {

        alert(
            "Document must be less than 5 MB."
        );

        event.target.value = "";

        return;
    }


    sendFile(file);


    event.target.value = "";
}


// =====================================
// SEND FILE
// =====================================

function sendFile(file) {

    if (!username || !secretKey) {

        alert(
            "Please join the secure chat first."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function () {

        try {

            const fileData =
                reader.result;


            const encryptedFile =
                encryptMessage(fileData);


            socket.emit(
                "chat message",
                {
                    username: username,

                    message: encryptedFile,

                    type: "file",

                    fileName: file.name,

                    fileType: file.type,

                    time:
                        new Date().toLocaleTimeString()
                }
            );

        } catch (error) {

            console.error(
                "File encryption error:",
                error
            );

            alert(
                "Unable to encrypt this file."
            );
        }
    };


    reader.onerror = function () {

        alert(
            "Unable to read the selected file."
        );
    };


    reader.readAsDataURL(file);
}


// =====================================
// RECEIVE CHAT MESSAGE
// =====================================

socket.on(
    "chat message",
    function (data) {

        const messages =
            document.getElementById(
                "messages"
            );


        const decryptedMessage =
            decryptMessage(
                data.message
            );


        const messageDiv =
            document.createElement(
                "div"
            );


        messageDiv.classList.add(
            "message"
        );


        // =================================
        // MY MESSAGE / OTHER USER
        // =================================

        if (
            data.username === username
        ) {

            messageDiv.classList.add(
                "me"
            );

        } else {

            messageDiv.classList.add(
                "other"
            );
        }


        // =================================
        // FILE MESSAGE
        // =================================

        if (data.type === "file") {

            const sender =
                document.createElement(
                    "strong"
                );

            sender.innerText =
                data.username;

            messageDiv.appendChild(
                sender
            );


            const time =
                document.createElement(
                    "small"
                );

            time.innerText =
                data.time;

            messageDiv.appendChild(
                time
            );


            // =============================
            // PHOTO
            // =============================

            if (
                data.fileType &&
                data.fileType.startsWith(
                    "image/"
                )
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    decryptedMessage;


                image.alt =
                    data.fileName;


                image.classList.add(
                    "chat-image"
                );


                messageDiv.appendChild(
                    image
                );
            }


            // =============================
            // FILE NAME
            // =============================

            const fileName =
                document.createElement(
                    "div"
                );

            fileName.innerText =
                "📎 " + data.fileName;

            fileName.style.marginTop =
                "8px";

            fileName.style.fontWeight =
                "bold";

            messageDiv.appendChild(
                fileName
            );


            // =============================
            // DOWNLOAD
            // =============================

            const downloadLink =
                document.createElement(
                    "a"
                );


            downloadLink.href =
                decryptedMessage;


            downloadLink.download =
                data.fileName;


            downloadLink.innerText =
                "📥 Download";


            downloadLink.classList.add(
                "download-link"
            );


            messageDiv.appendChild(
                downloadLink
            );


            // =============================
            // ENCRYPTION INFO
            // =============================

            const encryptedInfo =
                document.createElement(
                    "div"
                );


            encryptedInfo.classList.add(
                "encrypted"
            );


            encryptedInfo.innerText =
                "🔒 File encrypted before transmission";


            messageDiv.appendChild(
                encryptedInfo
            );
        }


        // =================================
        // TEXT MESSAGE
        // =================================

        else {

            const sender =
                document.createElement(
                    "strong"
                );

            sender.innerText =
                data.username;

            messageDiv.appendChild(
                sender
            );


            const time =
                document.createElement(
                    "small"
                );

            time.innerText =
                data.time;

            messageDiv.appendChild(
                time
            );


            const messageText =
                document.createElement(
                    "p"
                );

            messageText.innerText =
                decryptedMessage;

            messageDiv.appendChild(
                messageText
            );


            const encryptedInfo =
                document.createElement(
                    "div"
                );


            encryptedInfo.classList.add(
                "encrypted"
            );


            encryptedInfo.innerText =
                "🔒 Message encrypted before transmission";


            messageDiv.appendChild(
                encryptedInfo
            );
        }


        // =================================
        // ADD MESSAGE
        // =================================

        messages.appendChild(
            messageDiv
        );


        // Scroll to latest
        messages.scrollTop =
            messages.scrollHeight;
    }
);


// =====================================
// ENTER KEY
// =====================================

function handleEnter(event) {

    if (event.key === "Enter") {

        sendMessage();
    }
}


// =====================================
// LOGOUT
// =====================================

function logout() {

    username = "";

    secretKey = "";


    document.getElementById(
        "chatContainer"
    ).style.display = "none";


    document.getElementById(
        "loginBox"
    ).style.display = "flex";


    document.getElementById(
        "username"
    ).value = "";


    document.getElementById(
        "secretKey"
    ).value = "";


    document.getElementById(
        "messages"
    ).innerHTML = "";
}


// =====================================
// PHOTO INPUT
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const photoInput =
            document.getElementById(
                "photoInput"
            );


        const documentInput =
            document.getElementById(
                "documentInput"
            );


        if (photoInput) {

            photoInput.addEventListener(
                "change",
                sendPhoto
            );
        }


        if (documentInput) {

            documentInput.addEventListener(
                "change",
                sendDocument
            );
        }


        const messageInput =
            document.getElementById(
                "messageInput"
            );


        if (messageInput) {

            messageInput.addEventListener(
                "keydown",
                handleEnter
            );
        }

    }
);