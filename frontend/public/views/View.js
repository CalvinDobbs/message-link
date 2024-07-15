import router from "../router.js";
import logOutHandler from "../logOutHandler.js";

export default class View {
  constructor() {}

  navigateTo = (url) => {
    router(url);
  };

  unauthorizedRequestHandler = () => {
    logOutHandler();
    this.navigateTo("/log-in");
  };

  escapeHtml = (unsafe) => {
    return unsafe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  setDocTitle = (title) => {
    document.title = title;
  };

  setNavTitle = (title) => {
    document.querySelector("#nav-title").innerHTML = title;
  };

  setContent = (content) => {
    document.querySelector("#container").innerHTML = content;
  };

  render = async () => {
    document.querySelector("#container").innerHTML = "";
  };

  disconnect = async () => {
    return;
  };

  configureButtons = () => {
    document.querySelector("#back-button").classList.add("js-hidden");
    document.querySelector("#contacts-button").classList.add("js-hidden");
  };
}
