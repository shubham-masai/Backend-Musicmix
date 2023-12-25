const express = require("express");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userRouter = express.Router();
const {auth} = require("../middleware/auth.middleware")
userRouter.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        bcrypt.hash(password, 5, async (err, hash) => {
            if (err) {
                return res.status(400).send({ message: err.message });
            } else {
                const newUser = new UserModel({ username, email, password: hash });
                const token = jwt.sign({ userId: newUser._id }, "musicmix", { expiresIn: "1d" });

                await newUser.save();
                res.status(201).json({ message: "Registration successful.", token });
            }
        });
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
});

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ statusCode: 404, message: 'User not found' });
        }

        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                return res.status(400).send({ message: "Please check your credentials." });
            } else {
                const token = jwt.sign({ userId: user._id }, "musicmix", { expiresIn: "1d" });
                res.status(201).json({ message: "Login successful.", token });
            }
        });
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
});



userRouter.get("/profile",auth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile." });
    }
})

userRouter.post("/google", async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ userId: user._id }, "musicmix", { expiresIn: "1d" });
            // const { password: hashedPassword, ...rest } = user._doc;
            res.status(201).json({ message: "Registration successful.", token });
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const newUser = new UserModel({
                username: req.body.username,
                email: req.body.email,
                password: generatedPassword,
            });

            await newUser.save();
            const token = jwt.sign({ userId: newUser._id }, "musicmix", { expiresIn: "1d" });
            const { password: hashedPassword2, ...rest } = newUser._doc;
            res.status(201).json({ message: "Registration successful.", token });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});
module.exports = userRouter;