import type{Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { Types } from "mongoose";

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { chatId } = req.params;
        if (typeof chatId !== "string" || !Types.ObjectId.isValid(chatId)) {
            res.status(400).json({ message: "Invalid chat ID" });
            return;
        }
const chat = await Chat.findOne({
    _id: chatId,
    participants: userId ,
});

    if (!chat) {
        res.status(404).json({ message: "Chat not found or you are not a participant" });
        return;
    }
    const messages = await Message.find({ chat: chatId }).populate("sender", "name email avatar").sort({ createdAt: 1 });
    res.json({ messages });



    } catch (error) {
        res.status(500);
        next(error);
    }
}