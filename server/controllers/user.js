import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const registerUser = async (req, res) => {
  const { name, email, password,  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: passwordHash });
    await newUser.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: "1d"}
    );
  
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 1000, // 1hr
    });
  
    res.json({ message: "Login successful" });
  } catch(error) {
    res.status(500).json({ message: "Login Error" });
  }

};

const getCurrentUser = (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded_token.email });
  } catch(error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.status(200).json({ message: "Logged out" });
}

export { registerUser, loginUser, getCurrentUser, logoutUser };
