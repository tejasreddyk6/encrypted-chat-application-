// =====================================================
// ENCRYPTED CHAT APPLICATION
// =====================================================


// =====================================================
// SOCKET.IO
// =====================================================

const socket = io();


// =====================================================
// USER VARIABLES
// =====================================================

let username = "";
let secretKey = "";


// =====================================================
// FILE SIZE
// =====================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024;


// =====================================================
// JOIN CHAT
// =====================================================

function joinChat() {

    console.log("Join Chat button clicked");

    const usernameInput =
        document.getElementById("username");

    const secretKeyInput =
        document.getElementById("secretKey");

    if (!usernameInput || !secretKeyInput) {

        alert(
            "Login fields were not found. Please refresh the page."
        );

        console.error(
            "username or secretKey input missing"
        );

        return;
    }


    username =
        usernameInput.value.trim();

    secretKey =
        secretKeyInput.value;


    // Check username

    if (username === "") {

        alert(
            "Please enter your name."
        );

        usernameInput.focus();

        return;
    }


    // Check secret key

    if (secretKey.length < 4) {

        alert(
            "Secret key must contain at least 4 characters."
        );

        secretKeyInput.focus();

        return;
    }


    const loginBox =
        document.getElementById("loginBox");

    const chatContainer =
        document.getElementById("chatContainer");

    const welcome =
        document.getElementById("welcome");

    const messageInput =
        document.getElementById("messageInput");


    if (!loginBox || !chatContainer) {

        alert(
            "Chat page elements are missing."
        );

        console.error(
            "loginBox or chatContainer not found"
        );

        return;
    }


    // Hide login

    loginBox.style.display =
        "none";


    // Show chat

    chatContainer.style.display =
        "flex";


    // Show username

    if (welcome) {

        welcome.innerText =
            username;
    }


    // Focus message input

    if (messageInput) {

        messageInput.focus();
    }


    console.log(
        "Successfully joined secure chat as:",
        username
    );
}


// =====================================================
// ENTER KEY - LOGIN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const usernameInput =
            document.getElementById("username");

        const secretKeyInput =
            document.getElementById("secretKey");


        if (usernameInput) {

            usernameInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        joinChat();
                    }
                }
            );
        }


        if (secretKeyInput) {

            secretKeyInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        joinChat();
                    }
                }
            );
        }

    }
);


// =====================================================
// ENCRYPT MESSAGE
// =====================================================

function encryptMessage(message) {

    if (!secretKey) {

        return "";
    }


    return CryptoJS.AES.encrypt(
        message,
        secretKey
    ).toString();
}


// =====================================================
// DECRYPT MESSAGE
// =====================================================

function decryptMessage(encryptedMessage) {

    try {

        if (!secretKey) {

            return "Unable to decrypt message";
        }


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


// =====================================================
// SEND TEXT MESSAGE
// =====================================================

function sendMessage() {

    if (!username || !secretKey) {

        alert(
            "Please join the secure chat first."
        );

        return;
    }


    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) {

        return;
    }


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

            username:
                username,

            message:
                encryptedMessage,

            type:
                "text",

            time:
                new Date().toLocaleTimeString()

        }
    );


    input.value = "";

    input.focus();
}


// =====================================================
// ENTER KEY - MESSAGE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const messageInput =
            document.getElementById(
                "messageInput"
            );


        if (messageInput) {

            messageInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        sendMessage();
                    }

                }
            );
        }

    }
);


// =====================================================
// SEND PHOTO
// =====================================================

function sendPhoto(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert(
            "Please select an image file."
        );

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


// =====================================================
// SEND DOCUMENT
// =====================================================

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


// =====================================================
// SEND FILE
// =====================================================

function sendFile(file) {

    if (!username || !secretKey) {

        alert(
            "Please join the secure chat first."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const fileData =
                    reader.result;


                const encryptedFile =
                    encryptMessage(
                        fileData
                    );


                socket.emit(
                    "chat message",
                    {

                        username:
                            username,

                        message:
                            encryptedFile,

                        type:
                            "file",

                        fileName:
                            file.name,

                        fileType:
                            file.type,

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


    reader.onerror =
        function () {

            alert(
                "Unable to read the selected file."
            );
        };


    reader.readAsDataURL(file);
}


// =====================================================
// RECEIVE CHAT MESSAGE
// =====================================================

socket.on(
    "chat message",
    function (data) {

        const messages =
            document.getElementById(
                "messages"
            );


        if (!messages) {

            return;
        }


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


        // MY MESSAGE

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


        // =================================================
        // SENDER
        // =================================================

        const sender =
            document.createElement(
                "strong"
            );

        sender.innerText =
            data.username;

        messageDiv.appendChild(
            sender
        );


        // =================================================
        // TIME
        // =================================================

        const time =
            document.createElement(
                "small"
            );

        time.innerText =
            data.time;

        messageDiv.appendChild(
            time
        );


        // =================================================
        // FILE
        // =================================================

        if (data.type === "file") {


            // PHOTO

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


            // FILE NAME

            const fileName =
                document.createElement(
                    "div"
                );


            fileName.innerText =
                "📎 " +
                data.fileName;


            fileName.style.marginTop =
                "8px";


            fileName.style.fontWeight =
                "bold";


            messageDiv.appendChild(
                fileName
            );


            // DOWNLOAD

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


            // ENCRYPTION INFO

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


        } else {


            // =================================================
            // TEXT MESSAGE
            // =================================================

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


        // =================================================
        // ADD TO SCREEN
        // =================================================

        messages.appendChild(
            messageDiv
        );


        messages.scrollTop =
            messages.scrollHeight;
    }
);


// =====================================================
// PHOTO / DOCUMENT INPUTS
// =====================================================

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

    }
);


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    username = "";

    secretKey = "";


    const loginBox =
        document.getElementById(
            "loginBox"
        );


    const chatContainer =
        document.getElementById(
            "chatContainer"
        );


    const usernameInput =
        document.getElementById(
            "username"
        );


    const secretKeyInput =
        document.getElementById(
            "secretKey"
        );


    const messages =
        document.getElementById(
            "messages"
        );


    if (chatContainer) {

        chatContainer.style.display =
            "none";
    }


    if (loginBox) {

        loginBox.style.display =
            "flex";
    }


    if (usernameInput) {

        usernameInput.value = "";
    }


    if (secretKeyInput) {

        secretKeyInput.value = "";
    }


    if (messages) {

        messages.innerHTML = `

            <div class="welcome-message">

                <div class="welcome-icon">
                    🔒
                </div>

                <h2>Welcome to Encrypted Chat</h2>

                <p>
                    Your messages are encrypted before transmission.
                </p>

            </div>

        `;
    }


    closeAIAgent();
}


// =====================================================
// AI AGENT - OPEN
// =====================================================

function openAIAgent() {

    const panel =
        document.getElementById(
            "aiAgentPanel"
        );


    if (panel) {

        panel.style.display =
            "flex";


        const input =
            document.getElementById(
                "aiInput"
            );


        if (input) {

            input.focus();
        }
    }
}


// =====================================================
// AI AGENT - CLOSE
// =====================================================

function closeAIAgent() {

    const panel =
        document.getElementById(
            "aiAgentPanel"
        );


    if (panel) {

        panel.style.display =
            "none";
    }
}


// =====================================================
// ADD AI MESSAGE
// =====================================================

function addAIMessage(
    message,
    sender
) {

    const aiMessages =
        document.getElementById(
            "aiMessages"
        );


    if (!aiMessages) {

        return;
    }


    const messageDiv =
        document.createElement(
            "div"
        );


    messageDiv.classList.add(
        "ai-message"
    );


    if (sender === "user") {

        messageDiv.classList.add(
            "ai-user"
        );

        messageDiv.innerHTML =
            "<strong>You</strong><p></p>";

    } else {

        messageDiv.classList.add(
            "ai-bot"
        );

        messageDiv.innerHTML =
            "<strong>🤖 AI Agent</strong><p></p>";
    }


    const paragraph =
        messageDiv.querySelector(
            "p"
        );


    paragraph.innerText =
        message;


    aiMessages.appendChild(
        messageDiv
    );


    aiMessages.scrollTop =
        aiMessages.scrollHeight;
}


// =====================================================
// SEND MESSAGE TO AI
// =====================================================

async function sendAIMessage() {

    const input =
        document.getElementById(
            "aiInput"
        );


    if (!input) {

        return;
    }


    const message =
        input.value.trim();


    if (!message) {

        return;
    }


    addAIMessage(
        message,
        "user"
    );


    input.value = "";


    addAIMessage(
        "Thinking...",
        "bot"
    );


    try {

        const response =
            await fetch(
                "/api/ai-chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message:
                            message
                    })
                }
            );


        const data =
            await response.json();


        // Remove Thinking message

        const aiMessages =
            document.getElementById(
                "aiMessages"
            );


        if (aiMessages) {

            const allMessages =
                aiMessages.querySelectorAll(
                    ".ai-message"
                );


            const lastMessage =
                allMessages[
                    allMessages.length - 1
                ];


            if (
                lastMessage &&
                lastMessage.innerText.includes(
                    "Thinking..."
                )
            ) {

                lastMessage.remove();
            }
        }


        if (!response.ok) {

            addAIMessage(
                data.error ||
                "AI request failed.",
                "bot"
            );

            return;
        }


        addAIMessage(
            data.reply ||
            "No response received.",
            "bot"
        );


    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        // Remove Thinking message

        const aiMessages =
            document.getElementById(
                "aiMessages"
            );


        if (aiMessages) {

            const allMessages =
                aiMessages.querySelectorAll(
                    ".ai-message"
                );


            const lastMessage =
                allMessages[
                    allMessages.length - 1
                ];


            if (
                lastMessage &&
                lastMessage.innerText.includes(
                    "Thinking..."
                )
            ) {

                lastMessage.remove();
            }
        }


        addAIMessage(
            "Unable to connect to the AI Agent. Check the server and API key.",
            "bot"
        );
    }
}


// =====================================================
// AI ENTER KEY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const aiInput =
            document.getElementById(
                "aiInput"
            );


        if (aiInput) {

            aiInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        sendAIMessage();
                    }

                }
            );
        }

    }
);