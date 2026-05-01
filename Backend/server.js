import 'dotenv/config';
import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; // 1. Import cookie-parser
import { Server } from "socket.io";
import connectDB from "./Config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigin = ['http://localhost:5174', 
                       'http://localhost:5173',
                       process.env.FRONTEND_URL].filter(Boolean); // Filter out undefined values

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
});

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', "X-Requested-With"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 2. Setup cookie-parser middleware

app.set("io", io);

app.get("/", (req, res) => {
    res.send("API is running");
});

app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);

io.on("connection", (socket) => {
    console.log(`A user Connected ${socket.id}`);
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
        console.log(`User ${socket.id} joined room: ${userId}`);
    }
    socket.on("disconnect", () => {
        console.log(`User Disconnected ${socket.id}`);
    });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));