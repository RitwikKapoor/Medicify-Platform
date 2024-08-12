import User from "../models/UserModel.js";

const userCheck = async (req, res, next) => {
  if (req.user.role === "user") {
    next();
  } else {
    return res.status(401).json({ msg: "You are not authorized user only" });
  }
};

export default userCheck;
