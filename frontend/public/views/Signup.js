import View from "/public/views/View.js";
import backendURL from "../backendURL.js";

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export default class Signup extends View {
    constructor() {
        super();
    }

    render = async () => {
        if (localStorage.getItem("accessToken")) {
            return this.navigateTo("/");
        }
        this.setDocTitle("Sign Up - Message Link");
        this.setNavTitle("Message Link");
        this.setContent(`<div class="form">
      <div id="username-error" class="error-bubble error-bubble--hidden">Username already in use</div>
      <div id="email-error" class="error-bubble error-bubble--hidden">Email already in use</div>
      <input id="username" placeholder="username" type="text" class="form__input"/>
      <input id="email" placeholder="email" type="email" class="form__input"/>
      <input id="password" placeholder="password" type="password" class="form__input"/>
      <input id="confirm-password" placeholder="confirm password" type="password" class="form__input"/>
      <button id="signup-button" class="button button__form">Sign Up</button>
      <div class="form__text">Already have an account? <span class="form__link" id="log-in-link">Log in</span></div>
    </div>`);

        document.querySelectorAll("#log-in-link").forEach((conversation) => {
            conversation.addEventListener("click", (e) => {
                this.navigateTo("/log-in");
            });
        });

        document
            .querySelector("#signup-button")
            .addEventListener("click", (e) => {
                this.signup();
            });
        document.addEventListener("keypress", this.handleKeyPressEvent);
    };

    handleKeyPressEvent = (e) => {
        if (e.key == "Enter") {
            this.signup();
        }
    };

    disconnect = () => {
        document.removeEventListener("keypress", this.handleKeyPressEvent);
    };

    signup = async () => {
        if (localStorage.getItem("accessToken")) {
            return this.navigateTo("/");
        }
        const username = document.querySelector("#username").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const confirmPassword =
            document.querySelector("#confirm-password").value;

        const response = await fetch(`${backendURL}/auth/signup`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
            }),
        });

        const responseObject = await response.json();

        let invalidInput = false;

        document.querySelector("#email").classList.remove("form__input--error");
        document
            .querySelector("#password")
            .classList.remove("form__input--error");
        document
            .querySelector("#confirm-password")
            .classList.remove("form__input--error");
        document
            .querySelector("#username")
            .classList.remove("form__input--error");
        document
            .querySelector("#username-error")
            .classList.add("error-bubble--hidden");
        document
            .querySelector("#email-error")
            .classList.add("error-bubble--hidden");

        if (response.status == 422) {
            console.log("check");
            if (responseObject.data?.invalidField == "email") {
                document
                    .querySelector("#email")
                    .classList.add("form__input--error");
                document
                    .querySelector("#email-error")
                    .classList.remove("error-bubble--hidden");
                invalidInput = true;
            }
            if (responseObject.data?.invalidField == "username") {
                document
                    .querySelector("#username")
                    .classList.add("form__input--error");
                document
                    .querySelector("#username-error")
                    .classList.remove("error-bubble--hidden");
                invalidInput == true;
            }
        }

        if (!email || !validateEmail(email)) {
            document
                .querySelector("#email")
                .classList.add("form__input--error");
            invalidInput = true;
        }
        if (!password) {
            document
                .querySelector("#password")
                .classList.add("form__input--error");
            invalidInput = true;
        }
        if (!confirmPassword || confirmPassword !== password) {
            document
                .querySelector("#confirm-password")
                .classList.add("form__input--error");
            invalidInput = true;
        }
        if (!username) {
            document
                .querySelector("#username")
                .classList.add("form__input--error");
            invalidInput = true;
        }
        if (invalidInput) {
            return;
        }

        if (!response.ok) {
            return;
        }

        console.log(responseObject);

        localStorage.setItem("accessToken", responseObject.accessToken);

        this.navigateTo("/");
    };
}
