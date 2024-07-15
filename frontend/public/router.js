import Conversations from "./views/Conversations.js";
import Chat from "./views/Chat.js";
import Contacts from "./views/Contacts.js";
import Login from "./views/Login.js";
import Signup from "./views/Signup.js";
import NotFoundPage from "./views/404.js";

let currentView;

const pathToRegex = (path) =>
    new RegExp(
        "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(\\w+)") + "$"
    );

const getParams = (match) => {
    return match.regexMatch.slice(1)[0];
};

const router = async (url) => {
    if (url) {
        history.pushState(null, null, url);
    }
    if (currentView) {
        await currentView.disconnect();
    }
    const routes = [
        {
            path: "/",
            view: Conversations,
        },
        {
            path: "/log-in",
            view: Login,
        },
        {
            path: "/sign-up",
            view: Signup,
        },
        {
            path: "/contacts",
            view: Contacts,
        },
        {
            path: "/chat/:id",
            view: Chat,
        },
    ];

    const potentialMatches = routes.map((route) => {
        const regex = pathToRegex(route.path);
        route.regexMatch = location.pathname.match(regex);
        return route;
    });

    const match = potentialMatches.find((route) => {
        return route.regexMatch !== null;
    });

    if (!match) {
        const view = new NotFoundPage();
        view.render();
        view.configureButtons();
        return;
    }

    const view = new match.view();
    currentView = view;
    view.render(getParams(match));
    view.configureButtons();
};

export default router;
