const adminCheck = async (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "You are not authorized. Only admins are allowed" });
  }
};

export default adminCheck;
