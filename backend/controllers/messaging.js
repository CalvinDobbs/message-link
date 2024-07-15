const User = require("../models/user");
const Conversation = require("../models/conversation");
const socketIo = require("../socketIo");

exports.addContact = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            const error = new Error("Invalid access token");
            error.statusCode = 401;
            throw error;
        }
        const contactUsername = req.body.username;
        if (user.username == contactUsername) {
            const error = new Error("Cannot add self as contact");
            error.statusCode = 403;
            throw error;
        }
        const contact = await User.findOne({ username: contactUsername });
        if (!contact) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        if (
            user.contacts.find((userContact) => {
                return userContact.userId.toString() == contact._id.toString();
            })
        ) {
            const error = new Error("Contact already exists");
            error.statusCode = 422;
            throw error;
        }
        user.contacts.push({ userId: contact._id, username: contact.username });
        contact.contacts.push({ userId: user._id, username: user.username });
        await user.save();
        await contact.save();
        socketIo.getIo().to(contact._id.toString()).emit("update", {
            type: "contact",
            username: user.username,
            userId: user._id.toString(),
        });
        res.status(200).json({
            message: "Contact added",
            contact: { userId: contact._id, username: contact.username },
        });
    } catch (err) {
        next(err);
    }
};

exports.getContacts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            const error = new Error("Invalid access token");
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({
            message: "Contacts fetched",
            contacts: user.contacts,
            username: user.username,
        });
    } catch (err) {
        next(err);
    }
};

exports.startConversation = async (req, res, next) => {
    try {
        const partnerId = req.body.userId;
        const partner = await User.findById(partnerId);
        if (!partner) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Invalid access token");
            error.statusCode = 401;
            throw error;
        }
        let conversation = user.conversations.find((conversation) => {
            return conversation.partner.userId == partnerId;
        });
        if (!conversation) {
            conversation = new Conversation({
                users: [{ userId: partnerId }, { userId: req.userId }],
            });
            await conversation.save();
            user.conversations.push({
                conversationId: conversation._id,
                partner: { userId: partner._id, username: partner.username },
            });
            partner.conversations.push({
                conversationId: conversation._id,
                partner: { userId: user._id, username: user.username },
            });
            await user.save();
            await partner.save();
            socketIo.getIo().to(partner._id.toString()).emit("update", {
                type: "conversation",
                conversationId: conversation._id,
                username: user.username,
            });
            return res.status(201).json({
                message: "Conversation created",
                conversationId: conversation._id,
            });
        }
        res.status(200).json({
            message: "Conversation found",
            conversationId: conversation.conversationId,
        });
    } catch (err) {
        next(err);
    }
};

exports.sendMessage = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const message = req.body.message;
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Invalid access token");
            error.statusCode = 401;
            throw error;
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            const error = new Error("Conversation not found");
            error.statusCode = 404;
            throw error;
        }
        const userInConversation = conversation.users.find(
            (conversationUser) => {
                return (
                    conversationUser.userId.toString() == user._id.toString()
                );
            }
        );
        if (!userInConversation) {
            const error = new Error("Not authorized");
            error.statusCode = 401;
            throw error;
        }
        const timestamp = new Date();
        conversation.messages.push({
            userId: user._id,
            content: message,
            timestamp: timestamp,
        });
        await conversation.save();
        const target = conversation.users.find((conversationUser) => {
            return conversationUser.userId.toString() != user._id.toString();
        });
        socketIo.getIo().to(target.userId.toString()).emit("update", {
            type: "message",
            content: message,
            conversationId: conversation._id,
            timestamp: timestamp,
        });
        res.status(201).json({ message: "Message sent", content: message });
    } catch (err) {
        return next(err);
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const conversation = await Conversation.findById(conversationId);
        userInConversation = conversation.users.find((conversationUser) => {
            return conversationUser.userId.toString() == req.userId.toString();
        });
        if (!userInConversation) {
            const error = new Error("Not authorized");
            error.statusCode = 401;
            throw error;
        }
        conversation.messages.sort((a, b) => {
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
        messages = conversation.messages.map((message) => {
            const isMine = message.userId.toString() == req.userId.toString();
            return { content: message.content, isMine: isMine };
        });
        return res
            .status(200)
            .json({ message: "Conversation retrieved", messages: messages });
    } catch (err) {
        next(err);
    }
};

exports.getConversations = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate(
            "conversations.conversationId"
        );
        if (!user) {
            const error = new Error("Invalid access token");
            error.statusCode = 401;
            throw error;
        }
        if (user.conversations.length == 0) {
            return res.status(200).json({
                message: "Conversations retrieved",
                conversations: [],
            });
        }
        const conversations = user.conversations.map((userConversation) => {
            const conversation = userConversation.conversationId;
            const partner = userConversation.partner;
            conversation.messages.sort((a, b) => {
                return b.timestamp.getTime() - a.timestamp.getTime();
            });
            try {
                messagePreview = conversation.messages[0].content;
            } catch {
                messagePreview = "New Conversation";
            }
            try {
                timestamp = conversation.messages[0].timestamp;
            } catch {
                timestamp = "";
            }
            return {
                conversationId: userConversation.conversationId._id,
                username: partner.username,
                preview: messagePreview,
                timestamp: timestamp,
            };
        });
        res.status(200).json({
            message: "Conversations retrieved",
            conversations: conversations,
        });
    } catch (err) {
        next(err);
    }
};
