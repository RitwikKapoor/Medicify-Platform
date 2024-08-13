import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRoutes.js";
import { doctorRouter } from "./routes/doctorRoutes.js";
import { appointmentRouter } from "./routes/appointmentRoutes.js";
import { reviewRouter } from "./routes/reviewRoutes.js";
import Redis from "ioredis";
import Razorpay from "razorpay";
import path from "path";
const __dirname = path.resolve();

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.DB_URL, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => console.log(`MongoDB connection error: ${error.message}`));


app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_URL,
    })
  );
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/test", (req, res) => {
  res.send("Hello World! I am here.....");
});

app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/appoint", appointmentRouter);
app.use("/api/review", reviewRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


