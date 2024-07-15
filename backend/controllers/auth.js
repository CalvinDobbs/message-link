const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);

        const hashedPass = await bcrypt.hash(password, 12);

        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
            const error = new Error("Username already exists");
            error.statusCode = 422;
            error.data = { invalidField: "username", type: "duplicate" };
            throw error;
        }

        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            const error = new Error("Email already exists");
            error.statusCode = 422;
            error.data = { invalidField: "email", type: "duplicate" };
            throw error;
        }

        if (!errors.isEmpty()) {
            console.log(errors.array());
            const error = new Error("Invalid input");
            error.statusCode = 422;
            throw error;
        }

        const user = new User({
            username: username,
            email: email,
            password: hashedPass,
        });

        await user.save();

        const accessToken = generateAccessToken(user._id);

        res.status(201).json({
            message: "Account created",
            accessToken: accessToken,
        });
    } catch (error) {
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("Invalid email");
            error.statusCode = 401;
            error.data = { invalidField: "email", type: "unregistered" };
            throw error;
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            const error = new Error("Incorrect password");
            error.data = { invalidField: "password", type: "incorrect" };
            error.statusCode = 401;
            throw error;
        }

        const accessToken = generateAccessToken(user._id);

        res.status(200).json({
            message: "Sign in successful",
            accessToken: accessToken,
        });
    } catch (err) {
        return next(err);
    }
};

const generateAccessToken = (userId) => {
    return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
    });
};
