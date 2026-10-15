import mongoose, {Schema, type Document} from "mongoose";

export interface IUser extends Document {
    clerkID: string;
    name: string;
    email: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    
}
const userSchema = new Schema<IUser>({
    clerkID: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    avatar: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);