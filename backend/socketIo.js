const jwt = require("jsonwebtoken");

let io;

exports.init = (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    io.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("register", (accessToken) => {
            jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET,
                (err, payload) => {
                    if (err) {
                        return console.trace(err);
                    }
                    const userId = payload.userId;
                    socket.join(userId);
                }
            );
        });
    });
    return io;
};

exports.getIo = () => {
    return io;
};
