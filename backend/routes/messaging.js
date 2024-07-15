const express = require("express");
const { body } = require("express-validator");

const authenticateToken = require("../middleware/authenticateToken");
const messagingController = require("../controllers/messaging");

const router = express.Router();

router.post(
  "/add-contact",
  authenticateToken,
  [body("username").trim().escape()],
  messagingController.addContact
);

router.get("/contacts", authenticateToken, messagingController.getContacts);

router.put(
  "/start-conversation",
  authenticateToken,
  messagingController.startConversation
);

router.post(
  "/send-message/:conversationId",
  authenticateToken,
  [body("message").trim().escape()],
  messagingController.sendMessage
);

router.get(
  "/messages/:conversationId",
  authenticateToken,
  messagingController.getMessages
);

router.get(
  "/conversations",
  authenticateToken,
  messagingController.getConversations
);

module.exports = router;
