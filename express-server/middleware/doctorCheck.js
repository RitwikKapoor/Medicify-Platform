const doctorCheck = async (req, res, next) => {
  if (req.user.role === "doctor") {
    next();
  } else {
    return res.status(401).json({ msg: "You are not authorized doctor" });
  }
};

export default doctorCheck;
