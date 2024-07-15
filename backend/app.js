const express = require("express");
const mongoose = require("mongoose");
const http = require("http");

const authRoutes = require("./routes/auth");
const messagingRoutes = require("./routes/messaging");
const socketIo = require("./socketIo");

const app = express();
const server = http.createServer(app);
const io = socketIo.init(server);

app.use(express.json());
app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    next();
});

app.use("/auth", authRoutes);
app.use("/messaging", messagingRoutes);

app.use((error, req, res, next) => {
    console.trace(error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    if (!error.message) {
        error.message = "Server Error";
    }
    res.status(error.statusCode).json({
        message: error.message,
        data: error.data,
    });
});

mongoose.connect(`mongodb://test:example@mongo:27017`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

server.listen(8080, () => {
    console.log("Backend running");
});
