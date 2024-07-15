import View from "/public/views/View.js";

export default class NotFound extends View {
    constructor() {
        super();
    }

    render = async () => {
        this.setDocTitle("404");
        this.setNavTitle("Message Link");
        this.setContent("<h1>Page not found</h1>");
    };

    configureButtons = () => {
        document.querySelector("#back-button").classList.remove("js-hidden");
        document.querySelector("#contacts-button").classList.add("js-hidden");
    };
}
