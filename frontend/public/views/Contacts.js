import backendURL from "../backendURL.js";
import View from "/public/views/View.js";
import socketController from "../socketIo.js";

export default class Contacts extends View {
    constructor() {
        super();
    }

    render = async () => {
        this.setDocTitle("Contacts - Message Link");
        this.setNavTitle("Contacts");
        this.setContent(`<div class="spinner">
    <div class="load-spinner">
      <div class="linespinner"></div>
    </div>
  </div>`);

        const response = await fetch(`${backendURL}/messaging/contacts`, {
            method: "GET",
            headers: {
                authorization: "Bearer " + localStorage.getItem("accessToken"),
                "Content-Type": "application/json",
            },
        });
        let contactsHtml = "";
        const responseObject = await response.json();
        console.log(responseObject);
        let contacts = [];
        if (response.ok) {
            contacts = responseObject.contacts;
        }
        if (response.status == 401) {
            this.unauthorizedRequestHandler();
        }

        contacts.forEach((contact) => {
            contactsHtml += `<li class="contact">
      <span class="contact__username">${contact.username}</span>
      <button data-userId="${contact.userId}" class="button button__start-chat">Chat</button>
    </li>`;
        });

        if (contacts.length == 0) {
            contactsHtml = `<h1 id=empty-message>No Contacts</h1>`;
        }

        this.setContent(`<div class="contacts-container">
      <ul id="contacts" class="contacts">
        ${contactsHtml}
      </ul>
    </div>
    <div class="username-display"><span class=username-display__item>My username:</span><span class=username-display__item><b>${responseObject.username}</b></span></div>
    <footer class="composer">
      <input id="add-contact-textbox" placeholder="Username" class="composer__textbox"><button id="add-contact-button" class="button button__composer">Add</button>
    </footer>
  </div>`);

        document.querySelectorAll("[data-userid]").forEach((chatButton) => {
            chatButton.addEventListener("click", (e) => {
                this.startConversation(chatButton.dataset.userid);
            });
        });

        document
            .querySelector("#add-contact-button")
            .addEventListener("click", (e) => {
                this.addContact();
            });
        document.addEventListener("keypress", this.handleKeyPressEvent);

        document.addEventListener("socketUpdate", this.handleSocketEvent);
        socketController.initializeSocket();
    };

    disconnect = () => {
        document.removeEventListener("socketUpdate", this.handleSocketEvent);
        document.removeEventListener("keypress", this.handleKeyPressEvent);
    };

    handleSocketEvent = (e) => {
        if (e.detail.type == "contact") {
            this.appendContactHTML({
                username: e.detail.username,
                userId: e.detail.userId,
            });
        }
    };

    handleKeyPressEvent = (e) => {
        if (e.key == "Enter") {
            this.addContact();
        }
    };

    addContact = async () => {
        const contactUsername = document.querySelector(
            "#add-contact-textbox"
        ).value;
        const response = await fetch(`${backendURL}/messaging/add-contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
            body: JSON.stringify({
                username: contactUsername,
            }),
        });

        const responseObject = await response.json();
        console.log(responseObject);
        if (response.ok) {
            this.appendContactHTML(responseObject.contact);
            document.querySelector("#add-contact-textbox").value = "";
            document
                .querySelector("#add-contact-textbox")
                .classList.remove("composer__textbox--error");
        }
        if (response.status == 401) {
            this.unauthorizedRequestHandler();
        }
        if (response.status == 404 || response.status == 403) {
            document
                .querySelector("#add-contact-textbox")
                .classList.add("composer__textbox--error");
        }
    };

    appendContactHTML = (contact) => {
        try {
            document.querySelector("#empty-message").remove();
        } catch {}
        const contactsContainer = document.querySelector("#contacts");
        const contactsHtml = contactsContainer.innerHTML;
        contactsContainer.innerHTML =
            `<li class="contact">
    <span class="contact__username">${contact.username}</span>
    <button data-userId="${contact.userId}" class="button button__start-chat">Chat</button>
  </li>` + contactsHtml;
        document
            .querySelector(`[data-userid="${contact.userId}"]`)
            .addEventListener("click", (e) => {
                this.startConversation(contact.userId);
            });
    };

    startConversation = async (userId) => {
        const response = await fetch(
            `${backendURL}/messaging/start-conversation`,
            {
                method: "PUT",
                headers: {
                    authorization:
                        "Bearer " + localStorage.getItem("accessToken"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: userId }),
            }
        );
        const responseObject = await response.json();
        console.log(responseObject);
        if (response.ok) {
            return this.navigateTo("/chat/" + responseObject.conversationId);
        }
        if (response.status == 401) {
            this.unauthorizedRequestHandler();
        }
    };

    configureButtons = () => {
        document.querySelector("#back-button").classList.remove("js-hidden");
        document.querySelector("#contacts-button").classList.add("js-hidden");
    };
}
