import mongoose, {Schema, type Document} from "mongoose";

export interface IMessage extends Document {
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
const MessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true });

// index for faster queries
MessageSchema.index({ chat: 1, createdAt: 1 });
// 1 = ascending order, -1 = descending order

export const Message = mongoose.model('Message', MessageSchema);