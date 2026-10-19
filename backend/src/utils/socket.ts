import {Socket, Server as SocketServer} from "socket.io";
import {Server as httpServer} from "http";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { verifyToken } from "@clerk/express";
import {Chat} from "../models/Chat";

export const onlineUsers: Map<string, string> = new Map();

export const initializeSocket = (httpServer: httpServer) => {
    const allowedOrigins = [
        "http://localhost:8081",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];


    const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error: No token provided"));
        try {
            const session = await verifyToken(token,{secretKey: process.env.CLERK_SECRET_KEY!});

            const ClerkId = session.sub

            const user = await User.findOne({ clerkId: ClerkId });
            if (!user) return next(new Error("Authentication error: User not found"));

            socket.data.userId = user._id.toString();
            next();
            
        }catch (error: any) {
            next(new Error(error));
        
        }    
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        socket.emit("online-users",{userId:Array.from(onlineUsers.keys())})

        onlineUsers.set(userId, socket.id);

        socket.broadcast.emit("user-connected", { userId });

        socket.join(`user-connected: ${userId}`);

        socket.on("join-chat", (chatId: string) => {
            socket.join(`chat:${chatId}`);
        });
        socket.on("leave-chat", (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });

        socket.on("send-message", async (data: { chatId: string; text: string }) => {

            try {
                const {chatId, text} = data;
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId,
                });
                if (!chat) {
                    socket.emit("error", { message: "Chat not found or you are not a participant" });
                    return;
                }
                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    text,
                });
                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();
                await chat.save();

                await message.populate("sender", "name avatar");

                io.to(`chat:${chatId}`).emit("new-message", message);

                for(const participantId of chat.participants) {
                    io.to(`user-connected: ${participantId}`).emit("new-message-notification", message);
                }
            }catch (error) {
                socket.emit("error", { message: "Failed to send message" });

            }    
    }); 

    socket.on("typing", async(data) => {});

    socket.on("disconnect", async() => {
        onlineUsers.delete(userId);

        socket.broadcast.emit("user-disconnected", { userId });
    });

    
  });

  return io;
};
