import express from "express";
import jwtCheck from "../middleware/jwtCheck.js";
import adminCheck from "../middleware/adminCheck.js";

import {
  deleteUser,
  getAllUsers,
  getUserInfo,
  login,
  register,
  updateProfile,
  logout,
  changepassword,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", jwtCheck, logout);
router.get("/getUserInfo", jwtCheck, getUserInfo);
router.put("/update", jwtCheck, updateProfile);
router.put("/change-password", jwtCheck, changepassword);
router.get("/getAllUsers", jwtCheck, adminCheck, getAllUsers);
router.delete("/deleteUser", jwtCheck, adminCheck, deleteUser);

export { router as userRouter };
