import Doctor from "../models/DoctorModel.js";
import Appointment from "../models/AppointmentModel.js";
import mongoose from "mongoose";
import { Queue } from "bullmq";
import crypto from "crypto";
import { razorpay } from "../index.js";

const emailQueue = new Queue("email-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    // tls: {
    //   rejectUnauthorized: false,
    // },
  },
});


export const bookAppointment = async (req, res) => {
  const { date, time, email } = req.body;
  try {
    const part = date.split("-");
    const formattedDate = `${part[2]}-${part[1]}-${part[0]}`;

    const docInfo = await Doctor.findById(req.params.id).select("fees");

    const options = {
      amount: docInfo.fees * 100,
      currency: "INR",
      receipt: `rec_${req.params.id}`,
      notes: {
        doctorId: req.params.id,
        userId: req.user.id,
        date: formattedDate,
        email,
        time,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).send({ msg: "Appointment Booked", order });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).send({ msg: "Unable to book appointment" });
  }
};

export const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  const event = req.body;
  try {
    if (digest === req.headers["x-razorpay-signature"]) {
      if (event.event === "payment.captured") {
        const { notes } = event.payload.payment.entity;
        const { doctorId, userId, date, time, email } = notes;

        const appointment = new Appointment({
          date,
          time,
          doctorId,
          userId,
        });

        await appointment.save();

        await emailQueue.add(`email ${Date.now()}`, {
          email: email,
          text: `Payment Successful. Your appointment is confirmed for ${d} at ${time}`,
        });

        return res.status(201).send({ msg: "Appointment Booked" });
      }
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    res.status(400).json({ msg: "Webhook event handling failed" });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const app = await Appointment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "userinfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userinfo.0.userId",
          foreignField: "_id",
          as: "userinfo",
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          name: {
            $concat: [
              {
                $arrayElemAt: ["$userinfo.firstname", 0],
              },
              " ",
              {
                $arrayElemAt: ["$userinfo.lastname", 0],
              },
            ],
          },
          _id: 0,
        },
      },
    ]);

    return res.status(200).json(app);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Unable to get all appointments" });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const app = await Doctor.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "doctorId",
          as: "appoint",
        },
      },
      {
        $unwind: {
          path: "$appoint",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$appoint",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userinfo",
        },
      },
      {
        $set: {
          userinfo: {
            $concat: [
              {
                $first: "$userinfo.firstname",
              },
              " ",
              {
                $first: "$userinfo.lastname",
              },
            ],
          },
        },
      },
      {
        $project: {
          date: 1,
          time: 1,
          name: "$userinfo",
          _id: 0,
        },
      },
    ]);

    return res.status(200).json(app);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Unable to get all appointments" });
  }
};
