import View from "/public/views/View.js";
import backendURL from "../backendURL.js";

export default class Login extends View {
    constructor() {
        super();
    }

    render = async () => {
        if (localStorage.getItem("accessToken")) {
            return this.navigateTo("/");
        }

        this.setDocTitle("Log In - Message Link");
        this.setNavTitle("Message Link");
        this.setContent(`<div class="form">
      <input id="email" placeholder="email" type="email" class="form__input"/>
      <input id="password" placeholder="password" type="password" class="form__input"/>
      <button id="login-button" class="button button__form">Log In</button>
      <div class="form__text">Don't have an account? <span class="form__link" id="sign-up-link">Sign up</span></div>
    </div>`);

        document
            .querySelector("#sign-up-link")
            .addEventListener("click", (e) => {
                this.navigateTo("/sign-up");
            });

        document
            .querySelector("#login-button")
            .addEventListener("click", (e) => {
                this.login();
            });
        document.addEventListener("keypress", this.handleKeyPressEvent);
    };

    handleKeyPressEvent = (e) => {
        if (e.key == "Enter") {
            this.login();
        }
    };

    disconnect = () => {
        document.removeEventListener("keypress", this.handleKeyPressEvent);
    };

    login = async () => {
        if (localStorage.getItem("accessToken")) {
            return this.navigateTo("/");
        }
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        let missingInput = false;
        document.querySelector("#email").classList.remove("form__input--error");
        document
            .querySelector("#password")
            .classList.remove("form__input--error");
        if (!email) {
            document
                .querySelector("#email")
                .classList.add("form__input--error");
            missingInput = true;
        }
        if (!password) {
            document
                .querySelector("#password")
                .classList.add("form__input--error");
            missingInput = true;
        }
        if (missingInput) {
            return;
        }

        const response = await fetch(`${backendURL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const responseObject = await response.json();

        console.log(responseObject);

        if (response.status == 401) {
            if (responseObject.data.invalidField == "email") {
                document
                    .querySelector("#email")
                    .classList.add("form__input--error");
            }
            if (responseObject.data.invalidField == "password") {
                document
                    .querySelector("#password")
                    .classList.add("form__input--error");
            }
        }

        if (!response.ok) {
            return;
        }

        localStorage.setItem("accessToken", responseObject.accessToken);

        this.navigateTo("/");
    };
}
