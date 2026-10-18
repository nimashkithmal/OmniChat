import mongoose, {Schema, type Document} from "mongoose";

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    participantKey?: string;
    lastMessage: mongoose.Types.ObjectId;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // Sorted "userA:userB" pair; sparse so legacy chats without a key don't collide
    participantKey: { type: String, unique: true, sparse: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date , default: null },
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);