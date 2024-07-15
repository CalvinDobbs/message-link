import backendURL from "../backendURL.js";
import View from "/public/views/View.js";
import socketController from "../socketIo.js";

const previewLength = 100;

export default class Conversations extends View {
    constructor() {
        super();
    }

    render = async () => {
        console.log("rendering");
        this.setDocTitle("Conversations - Message Link");
        this.setNavTitle("Conversations");
        this.setContent(`<div class="spinner">
    <div class="load-spinner">
      <div class="linespinner"></div>
    </div>
  </div>`);

        const response = await fetch(`${backendURL}/messaging/conversations`, {
            method: "GET",
            headers: {
                authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
        });
        const responseObject = await response.json();
        console.log(responseObject);

        if (response.status == 401) {
            return this.unauthorizedRequestHandler();
        }

        let conversations = [];
        if (response.ok) {
            conversations = responseObject.conversations;
        }

        let conversationsHtml = "";
        conversations.forEach((conversation) => {
            const messagePreview =
                conversation.preview.length > previewLength
                    ? conversation.preview.slice(0, previewLength - 1) +
                      "&hellip;"
                    : conversation.preview;
            const timestamp = this.formatTimestamp(conversation.timestamp);
            conversationsHtml += `<li data-conversationid="${conversation.conversationId}" class="conversation">
  <div class="conversation__username">${conversation.username}</div>
  <div class="conversation__message">
    <div class="conversation__message-content"
      >${messagePreview}</div
    >
    <div class="conversation__message-timestamp">${timestamp}</div>
  </div>
  </li>`;
        });

        if (conversations.length == 0) {
            conversationsHtml = '<h1 id="empty-message">No Conversations<h1>';
        }

        this.setContent(
            `<div class="conversations_container"><ul class="conversations" id="conversations">${conversationsHtml}</ul></div>`
        );

        document
            .querySelectorAll("[data-conversationid]")
            .forEach((conversation) => {
                conversation.addEventListener("click", (e) => {
                    console.log(conversation.dataset);
                    this.navigateTo(
                        "/chat/" + conversation.dataset.conversationid
                    );
                });
            });

        document.addEventListener("socketUpdate", this.handleSocketEvent);
        console.log("added listener");
        socketController.initializeSocket();
    };

    handleSocketEvent = (e) => {
        console.log("socket event");
        if (e.detail.type == "conversation") {
            this.appendConversationHTML({
                conversationId: e.detail.conversationId,
                username: e.detail.username,
                preview: "New Conversation",
                timestamp: "",
            });
        }
        if (e.detail.type == "message") {
            const messageElement = document.querySelector(
                `[data-conversationid="${e.detail.conversationId}"]`
            );
            const messagePreview =
                e.detail.content.length > previewLength
                    ? e.detail.content.slice(0, previewLength - 1) + "&hellip;"
                    : e.detail.content;
            messageElement.querySelector(
                ".conversation__message-content"
            ).innerHTML = messagePreview;
            messageElement.querySelector(
                ".conversation__message-timestamp"
            ).innerHTML = this.formatTimestamp(e.detail.timestamp);
        }
    };

    appendConversationHTML = (conversation) => {
        try {
            document.querySelector("#empty-message").remove();
        } catch {}
        const conversationsContainer = document.querySelector("#conversations");
        const conversationsHtml = conversationsContainer.innerHTML;
        conversationsContainer.innerHTML =
            `<li data-conversationid="${conversation.conversationId}" class="conversation">
    <div class="conversation__username">${conversation.username}</div>
    <div class="conversation__message">
      <div class="conversation__message-content"
        >${conversation.preview}</div
      >
      <div class="conversation__message-timestamp">${conversation.timestamp}</div>
    </div>
    </li>` + conversationsHtml;
        document
            .querySelector(
                `[data-conversationid="${conversation.conversationId}"]`
            )
            .addEventListener("click", (e) => {
                this.navigateTo("/chat/" + conversation.conversationId);
            });
    };

    configureButtons = () => {
        const backButton = document.querySelector("#back-button");
        backButton.classList.remove("js-hidden");
        backButton.dataset.link = "logOutHandler";
        backButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="button__icon" viewBox="0 0 512 512">
    <title>Log Out</title>
    <path d="M304 336v40a40 40 0 01-40 40H104a40 40 0 01-40-40V136a40 40 0 0140-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" fill="none" stroke="#F7EBEC" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
</svg>`;
        document
            .querySelector("#contacts-button")
            .classList.remove("js-hidden");
    };

    formatTimestamp = (timestamp) => {
        let date;
        try {
            date = new Date(timestamp);
        } catch {
            return "Invalid Timestamp";
        }
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
            timeStyle: "short",
        }).format(date);
    };

    disconnect = () => {
        document.removeEventListener("socketUpdate", this.handleSocketEvent);
        const backButton = document.querySelector("#back-button");
        backButton.dataset.link = "/";
        backButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="button__icon" viewBox="0 0 512 512">
          <title>Caret Back</title>
          <path class="svg__path" d="M321.94 98L158.82 237.78a24 24 0 000 36.44L321.94 414c15.57 13.34 39.62 2.28 39.62-18.22v-279.6c0-20.5-24.05-31.56-39.62-18.18z" />
      </svg>`;
    };
}
