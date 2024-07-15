import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import backendURL from "./backendURL.js";

let socket = io(backendURL);
let registered = false;

const socketController = {
    initializeSocket: () => {
        if (!registered) {
            socket.on("update", (update) => {
                const event = new CustomEvent("socketUpdate", {
                    detail: update,
                });
                document.dispatchEvent(event);
                console.log(update);
            });
            socket.emit("register", localStorage.getItem("accessToken"));
            console.log("Socket registered");
            registered = true;
        }
    },
    resetSocket: () => {
        socket = io(backendURL, { forceNew: true });
        registered = false;
    },
};

export default socketController;

//on page load create socket

//if authenticated and accessing content and not already in room, request
//server to add socket to room named (userId) retrieved from validated token and set client-side in-room status to true

//on logout destroy and create new socket and set in-room status to false

//emit all updates (new message, new contact, new conversation) to the (userId)-room
//of the user recieving the update

//create client side custom events for updates

//listen for events in views
