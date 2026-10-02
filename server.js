
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Groq = require("groq-sdk");

// =====================================
// EXPRESS SERVER
// =====================================

const app = express();
const server = http.createServer(app);

// =====================================
// SOCKET.IO
// =====================================

const io = new Server(server, {
    maxHttpBufferSize: 10 * 1024 * 1024
});

// =====================================
// PORT
// =====================================

const PORT = process.env.PORT || 3000;

// =====================================
// EXPRESS SETTINGS
// =====================================

app.use(express.json({
    limit: "20mb"
}));

app.use(express.static(__dirname));

// =====================================
// GROQ AI SETUP
// =====================================

let groq = null;

if (process.env.GROQ_API_KEY) {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    console.log("Groq API key detected.");
} else {
    console.log("WARNING: GROQ_API_KEY is missing.");
}

// =====================================
// SOCKET CONNECTION
// =====================================

io.on("connection", function (socket) {

    console.log("User connected:", socket.id);

    socket.on("chat message", function (data) {

        console.log(
            "Chat message received from:",
            data.username
        );

        io.emit("chat message", data);
    });

    socket.on("disconnect", function () {

        console.log(
            "User disconnected:",
            socket.id
        );
    });
});

// =====================================
// GROQ AI AGENT
// =====================================

app.post("/api/ai-chat", async function (req, res) {

    try {

        const message =
            String(req.body.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        if (!groq) {
            return res.status(500).json({
                error: "Groq AI is not configured. Check GROQ_API_KEY in .env."
            });
        }

        console.log("AI question:", message);

        const completion =
            await groq.chat.completions.create({

              model: "openai/gpt-oss-120b",

                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful AI assistant inside an Encrypted Chat Application. Answer clearly and politely."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],

                temperature: 0.7,
                max_tokens: 1024
            });

        const reply =
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message
                ? completion.choices[0].message.content
                : "";

        console.log("Groq AI response received.");

        return res.json({
            reply: reply || "The AI returned an empty response."
        });

    } catch (error) {

        console.log("GROQ AI ERROR:", error.message);

        const status = Number(error.status);

        if (status === 429) {
            return res.status(429).json({
                error:
                    "Groq free-tier limit reached. Please wait or check your API usage limits."
            });
        }

        if (status === 401 || status === 403) {
            return res.status(status).json({
                error:
                    "Groq API authentication failed. Check your GROQ_API_KEY."
            });
        }

        if (status === 503 || status === 502) {
            return res.status(503).json({
                error:
                    "Groq AI is temporarily unavailable. Please try again later."
            });
        }

        return res.status(500).json({
            error:
                "Groq AI request failed. Please check the server terminal."
        });
    }
});

// =====================================
// HEALTH CHECK
// =====================================

app.get("/api/health", function (req, res) {

    res.json({

        status: "ok",

        server: "Encrypted Chat Server",

        ai: Boolean(process.env.GROQ_API_KEY),

        aiProvider: "Groq"
    });
});

// =====================================
// START SERVER
// =====================================

server.listen(PORT, "0.0.0.0", function () {

    console.log("");
    console.log("======================================");
    console.log("Encrypted Chat Server running");
    console.log("Port:", PORT);
    console.log("AI Agent: Groq");
    console.log("======================================");
    console.log("");
});