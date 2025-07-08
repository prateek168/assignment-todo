import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import notesRoutes from "./routes/notes.routes";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL!,
  credentials: true
}))
app.use(express.json()); 
app.use(passport.initialize()); 

app.use("/api/auth", authRoutes);
app.use('/api/notes',notesRoutes)
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));



app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;