import express from 'express';
import {clerkMiddleware} from '@clerk/express';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandle';

const app = express();

app.use(express.json()); //middleware to parse json data

app.use(clerkMiddleware()); //middleware to handle authentication and authorization

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.use("api/auth",authRoutes)
app.use("api/chat",chatRoutes)
app.use("api/messages",messageRoutes)
app.use("api/users",userRoutes)

app.use(errorHandler); //middleware to handle errors

export default app; 