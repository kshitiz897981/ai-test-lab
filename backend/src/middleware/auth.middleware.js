import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access, token is missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access, user not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        });
    }
};