import type { AuthRequest } from "../middleware/auth";
import type { NextFunction, Response } from "express";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
import { Types } from "mongoose";

export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        
        // Assuming you have a Chat model and a method to get chats for a user
        const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name email avatar')
        .populate("lastMessage")
        .sort({ lastMessageAt: -1 }); // Populate participant details

        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id.toString() !== userId)
            return {
                _id: chat._id,
                participants: otherParticipant ?? null,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                createdAt: chat.createdAt,
            }
        })
        res.json({ chats: formattedChats });    

    } catch (error) {
        res.status(500);
        next(error);
    }
}


export async function getOrCreateChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { participantId } = req.params;

        if (!participantId || typeof participantId !== "string") {
            res.status(400).json({ message: 'Participant ID is required' });
            return;
        }
        if(!Types.ObjectId.isValid(participantId)) {
            return res.status(400).json({ message: 'Invalid participant ID' });
        
        }
        const normalizedParticipantId = new Types.ObjectId(participantId).toString();
        if (userId === normalizedParticipantId) {
            res.status(400).json({ message: 'Cannot create a chat with yourself' });
            return;
        }

        // Check if a chat already exists between the two users
        let chat = await Chat.findOne({
            participants: { $all: [userId, normalizedParticipantId] }
        });

        if (!chat) {
            const participantExists = await User.exists({ _id: normalizedParticipantId });
            if (!participantExists) {
                res.status(404).json({ message: 'Participant not found' });
                return;
            }

            // Atomic create-or-fetch keyed by the sorted participant pair
            const participantKey = [userId, normalizedParticipantId].sort().join(":");
            try {
                chat = await Chat.findOneAndUpdate(
                    { participantKey },
                    { $setOnInsert: { participants: [userId, normalizedParticipantId] } },
                    { upsert: true, returnDocument: "after" }
                );
            } catch (error) {
                if ((error as { code?: number }).code !== 11000) throw error;
                chat = await Chat.findOne({ participantKey });
            }
            if (!chat) throw new Error("Failed to create or fetch chat");
        }
        await chat.populate([
            { path: "participants", select: "name email avatar" },
            { path: "lastMessage" },
        ]);
        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);


        res.json({ 
            _id: chat._id,
            participants: otherParticipant ?? null,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            createdAt: chat.createdAt,
        });

    } catch (error) {
        res.status(500);
        next(error);
    }
}
