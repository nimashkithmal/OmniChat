import type { Request, Response, NextFunction} from "express";
import { getAuth } from "@clerk/express";
import { User } from "../models/User";
import {requireAuth} from "@clerk/express";

export type AuthRequest = Request & {
    userId?: string;
    // other properties you want to add
}

export const protectRoute =[
    requireAuth(),
    async (req: AuthRequest, res: Response, next: NextFunction) => {  
        try {
            const { userId:clerkId } = getAuth(req);
            if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });  


            const user = await User.findOne({ clerkId });
            if (!user) return res.status(404).json({ message: "user not found" });

            req.userId = user._id.toString();
            next();
        }catch (error) {
            // console.log(error);
            console.error("Error in protectRoute middleware:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
]
