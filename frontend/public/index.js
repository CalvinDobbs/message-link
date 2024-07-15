import router from "./router.js";
import logOutHandler from "./logOutHandler.js"

window.addEventListener("popstate", () => {
  router();
});

document.addEventListener("DOMContentLoaded", () => {
  router();
  document.querySelectorAll("[data-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.link == 'logOutHandler') {
        logOutHandler();
        return await router('/log-in');
      }
      await router(button.dataset.link);
    });
  });
});
