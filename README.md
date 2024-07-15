# Message Link

This is a mobile friendly web app for real-time messaging using NodeJS and Websockets.

Try it out: [messagelink.calvindobbs.com](https://messagelink.calvindobbs.com)

## Usage

Click "Sign up" and make an account:
<img src="/README/signup.png" alt="A sign in screen allowing the user to enter a username, email, and password" height="500" />

Or "Log in":
<img src="/README/login.png" alt="A log in screen allowing the user to enter an email and password" height="500" />

Add a contact by their username and press chat:
<img src="/README/contacts.png" alt="List of contacts on the contacts screen" height="500" />

Chat in real time:
<img src="/README/chat.png" alt="A real time conversation through message bubbles" height="500" />

View your active conversations:
<img src="/README/conversations.png" alt="A list of active conversations with recent message previews" height="500" />

## Setup Instructions

To get started you'll want to install Docker Desktop [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)

If you're on Linux you may also need to install the Docker Compose plugin [docs.docker.com/compose/install](https://docs.docker.com/compose/install/)

Next, make a Replicate account and grab your API token [replicate.com/account](http://replicate.com/account).

Create a file called `.env` in the root project directory and set the following environment variables:

```console
ACCESS_TOKEN_SECRET=...
MONGODB_USERNAME=...
MONGODB_PASSWORD=...
```

Note: All three environement variables can be given any values without affecting the app.

Then open the project directory in your terminal and run the app:

```console
docker compose up
```
