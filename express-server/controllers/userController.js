import User from "../models/UserModel.js";
import Doctor from "../models/DoctorModel.js";
import Appointment from "../models/AppointmentModel.js";
import Review from "../models/ReviewModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const emailPresent = await User.findOne({ email: req.body.email });
    if (emailPresent) {
      return res.status(409).json({ msg: "Email already exists" });
    }
    const photo = req.body.photo || User.schema.path("photo").default();
    const user = await User({ ...req.body, photo });
    const result = await user.save();
    if (!result) {
      return res.status(500).json({ msg: "Unable to register user" });
    }
    return res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.log(error);
    return res.statusz(500).json({ msg: "Unable to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const userPresent = await User.findOne({ email: req.body.email });
    if (!userPresent) {
      return res.status(400).json({ msg: "No such user, register first" });
    }
    const verifyPass = await bcrypt.compare(
      req.body.password,
      userPresent.password
    );
    if (!verifyPass) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign({ userId: userPresent._id, role: userPresent.role }, process.env.JWT_SECRET);

    res.cookie("my_cookie", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV !== "development",
    });

    return res.status(200).json({
      msg: "User logged in successfully",
    });
  } catch (error) {
    return res.status(500).json({ msg: "Unable to login user" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("my_cookie");
  res.send();
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "photo firstname lastname role email"
    );
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).json({ msg: "Unable to get user" });
  }
};

export const updateProfile = async (req, res) => {
  const { dob } = req.body;
  try {
    const updateFields = { ...req.body };

    if (dob) {
      const part = dob.split("-");
      const formattedDate = `${part[2]}-${part[1]}-${part[0]}`;
      updateFields.dob = formattedDate.toString();
    }

    const result = await User.findByIdAndUpdate(
      { _id: req.user.id },
      {
        ...updateFields,
      }
    );
    if (!result) {
      return res.status(500).send({ msg: "Unable to update user" });
    }
    return res.status(200).send({ msg: "User updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Unable to update user" });
  }
};

export const changepassword = async (req, res) => {
  try {
    if (req.body.newPassword === req.body.currentPassword) {
      return res
        .status(400)
        .json({ msg: "Old Password and New Password is same" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ msg: "No such user, register first" });
    }

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const newPassword = req.body.newPassword;
    const hashpassword = await bcrypt.hash(newPassword, 10);

    const result = await User.findByIdAndUpdate(
      { _id: user._id },
      { password: hashpassword },
      { new: true }
    );

    if (!result) {
      return res.status(500).send({ msg: "Unable to update user password" });
    }

    return res.status(200).send({ msg: "User password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Unable to update user password" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "firstname lastname email gender photo"
    );
    return res.status(200).send(users);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Unable to get all users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.body.id);
    await Doctor.findOneAndDelete({
      userId: req.body.id,
    });

    await Appointment.deleteMany({ userId: req.body.id })
      .then((res) => {
        console.log(
          `Deleted ${res.deletedCount} appointments with userId '${req.body.id}'.`
        );
      })
      .catch((error) => {
        console.error(error);
      });

    const reviews = await Review.find({ userId: req.body.id });
    const doctorIds = new Set(reviews.map((review) => review.doctorId));

    await Review.deleteMany({ userId: req.body.id })
      .then((res) => {
        console.log(
          `Deleted ${res.deletedCount} reviews with userId '${req.body.id}'.`
        );
      })
      .catch((error) => {
        console.error(error);
      });

    // to recalculate ratings when a user is deleted
    for (const doctorId of doctorIds) {
      await Review.calcAverageRatings(doctorId);
    }

    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Unable to delete user" });
  }
};
