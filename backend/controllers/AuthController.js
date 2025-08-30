import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { compare } from "bcrypt";

const maxTime = 3 * 24 * 60 * 60 * 1000; // Token expiration time

// Create JWT token
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.SERCRET_KEY, { expiresIn: maxTime });
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        // Create new user
        const user = await User.create({ email, password });

        // Set JWT token in cookies
        res.cookie("jwt", createToken(email, user.id), {
            maxAge: maxTime, // Fix incorrect key: maxAge instead of maxTime
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        });
    } catch (error) {
        console.error(error); // Log actual error for debugging
        return res.status(500).send("Server error");
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("Invalid User! Please register");
        }

        // Verify password
        const verifypass = await compare(password, user.password);
        if (!verifypass) {
            return res.status(400).send("Invalid password");
        }

        // Set JWT token in cookies
        res.cookie("jwt", createToken(email, user.id), {
            maxAge: maxTime, // Fix incorrect key: maxAge instead of maxTime
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        });
    } catch (error) {
        console.error(error); // Log actual error for debugging
        return res.status(500).send("Server error");
    }
};

export const getUserData = async (req, res, next) => {
    try {
        const userId = req.userId;
        const userdata = await User.findById(userId);

        if (!userdata) {
            return res.status(404).send("User does not exist");
        }

        return res.status(200).json({
            id: userdata.id,
            email: userdata.email,
            profileSetup: userdata.profileSetup,
            firstName: userdata.firstName,
            lastName: userdata.lastName,
            image: userdata.image,
            color: userdata.color,
        });
    } catch (error) {
        console.error(error); // Log actual error for debugging
        return res.status(500).send("Server error");
    }
};

export const updateprofile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).send("First name, last name, and color are required");
        }

        const userdata = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            color,
            profileSetup: true,
        }, { new: true, runValidators: true });

        return res.status(200).json({
            id: userdata.id,
            email: userdata.email,
            profileSetup: userdata.profileSetup,
            firstName: userdata.firstName,
            lastName: userdata.lastName,
            image: userdata.image,
            color: userdata.color,
        });
    } catch (error) {
        console.error(error); // Log actual error for debugging
        return res.status(500).send("Server error");
    }
};

export const logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error); // Log actual error for debugging
        return res.status(500).send("Server error");
    }
};
