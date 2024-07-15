import backendURL from "../backendURL.js";
import socketController from "../socketIo.js";
import View from "/public/views/View.js";

let chatboxInitialHeight;
let conversationId;

export default class Chat extends View {
    constructor() {
        super();
    }

    render = async (params) => {
        conversationId = params;
        this.setDocTitle("Chat - Message Link");
        this.setNavTitle("Chat");
        this.setContent(`<div class="spinner">
    <div class="load-spinner">
      <div class="linespinner"></div>
    </div>
  </div>`);

        //fetch messages from server
        const response = await fetch(
            `${backendURL}/messaging/messages/` + conversationId,
            {
                method: "GET",
                headers: {
                    authorization:
                        "Bearer " + localStorage.getItem("accessToken"),
                },
            }
        );
        const responseObject = await response.json();
        console.log(responseObject);
        if (response.status == 401) {
            return this.unauthorizedRequestHandler();
        }
        if (!response.ok) {
            return;
        }

        const messages = responseObject.messages;

        let messagesHtml = "";
        messages.forEach((message) => {
            messagesHtml += `<li class="message${
                message.isMine ? " js-mine" : ""
            }">
      <p class="message__content">${message.content.replace(/\n/g, "<br>")}</p> 
    </li>`;
        });

        this
            .setContent(`<div class="composer__container"><div class="messages-container">
      <ul id="messages" class="messages">
        ${messagesHtml}
      </ul>
    </div>
    <footer class="composer">
      <textarea placeholder="Message" class="composer__textbox" id="chatbox"></textarea
      ><button class="button button__composer" id="send-button">Send</button>
    </footer></div>`);

        fullScroll();

        const chatbox = document.querySelector("#chatbox");
        chatboxInitialHeight = chatbox.clientHeight - 5;
        chatbox.addEventListener("keyup", this.handleKeyUpEvent);
        chatbox.addEventListener("keypress", this.handleKeyDownEvent);

        document
            .querySelector("#send-button")
            .addEventListener("click", (e) => {
                this.sendMessage();
            });

        document.addEventListener("socketUpdate", this.handleSocketEvent);
        socketController.initializeSocket();
    };

    disconnect = () => {
        document.removeEventListener("socketUpdate", this.handleSocketEvent);
    };

    handleKeyUpEvent = () => {
        const chatbox = document.querySelector("#chatbox");
        chatbox.style.height = `${chatboxInitialHeight}px`;
        if (chatbox.scrollHeight > chatbox.clientHeight) {
            if (chatbox.scrollHeight >= chatboxInitialHeight * 8) {
                return (chatbox.style.height = `${
                    chatboxInitialHeight * 8 - 9
                }px`);
            }
            chatbox.style.height = `${chatbox.scrollHeight}px`;
            fullScroll();
        }
    };

    handleKeyDownEvent = (e) => {
        if (e.key != "Enter" || e.shiftKey) return;
        e.preventDefault();
        this.sendMessage();
    };

    handleSocketEvent = (e) => {
        if (e.detail.type == "message") {
            this.appendMessageHTML({
                content: e.detail.content,
                isMine: false,
            });
        }
    };

    sendMessage = async () => {
        if (!conversationId) {
            return;
        }
        const message = document.querySelector("#chatbox").value;
        if (!message.trim()) {
            return;
        }

        const response = await fetch(
            `${backendURL}/messaging/send-message/` + conversationId,
            {
                method: "POST",
                headers: {
                    authorization:
                        "Bearer " + localStorage.getItem("accessToken"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            }
        );
        console.log(response);
        const responseObject = await response.json();
        console.log(responseObject);
        if (response.status == 401) {
            return this.unauthorizedRequestHandler();
        }
        if (response.ok) {
            document.querySelector("#chatbox").value = "";
            this.handleKeyUpEvent();
            fullScroll();
            this.appendMessageHTML({
                content: responseObject.content,
                isMine: true,
            });
        }
    };

    appendMessageHTML = (message) => {
        const messagesBox = document.querySelector(".messages-container");
        const isFullscrolled =
            messagesBox.scrollTop + messagesBox.offsetHeight >=
            messagesBox.scrollHeight;
        const messagesContainer = document.querySelector("#messages");
        const messagesHtml = messagesContainer.innerHTML;
        messagesContainer.innerHTML =
            `<li class="message${message.isMine ? " js-mine" : ""}">
    <p class="message__content">${message.content.replace(/\n/g, "<br>")}</p> 
  </li>` + messagesHtml;
        if (isFullscrolled) {
            fullScroll();
        }
    };

    configureButtons = () => {
        document.querySelector("#back-button").classList.remove("js-hidden");
        document
            .querySelector("#contacts-button")
            .classList.remove("js-hidden");
    };
}

const fullScroll = () => {
    const messagesBox = document.querySelector(".messages-container");
    messagesBox.scrollTo(0, messagesBox.scrollHeight);
};
