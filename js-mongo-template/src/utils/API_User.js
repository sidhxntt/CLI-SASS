//  Usage: This file contains the class for API User. It contains methods for signup, login, and other user related operations. 
// It extends the Data class and uses the PrismaClient instance for database operations. 
// The class also contains methods for sending email and SMS notifications using Bull queues.

import bcrypt from "bcrypt";
import JWT from "../controllers/Authentication.js";
import dotenv from "dotenv";
import Data from "./Data.js";
import { emailQueue, smsQueue } from "./client/Queues.js";

dotenv.config();

export default class User extends Data {
  constructor(prisma) {
    super(prisma.api_users);
    this.prisma = prisma;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  signupPage = (req, res) => {
    console.info("Signup page accessed");
    return this.sendResponse(
      res,
      200,
      "Signup to Login. Provide your username & password to signup in json format in request body."
    );
  };

  signup = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return this.sendResponse(
        res,
        400,
        "Email and password are required",
        undefined,
        "Missing required fields"
      );
    }

    if (!this.isValidEmail(email)) {
      return this.sendResponse(
        res,
        400,
        "Invalid email format",
        undefined,
        "Invalid email"
      );
    }

    const existingUser = await this.prisma.api_users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return this.sendResponse(
        res,
        400,
        "Username already exists",
        undefined,
        "Duplicate email"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.api_users.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "user",
      },
    });

    const emailJob = await emailQueue.add("send-email", {
      email: process.env.SMTP_FROM,
      message: "New User added to API",
    });
    console.info(`Added job to email queue. Email Job ID: ${emailJob.id}`);

    const smsJob = await smsQueue.add("send-sms", {
      to: process.env.PHONE_NUMBER,
      message: "New User added to API",
    });
    console.info(`Added job to SMS queue. SMS Job ID: ${smsJob.id}`);

    console.info("New API user created");
    return this.sendResponse(res, 201, "User created successfully", {
      id: newUser.id,
      email: newUser.email,
      message: "User created successfully",
      instruction: "Login to continue",
    });
  };

  loginPage = (req, res) => {
    console.info("Login Page Accessed");
    return this.sendResponse(
      res,
      200,
      "Login to Continue. Provide your username & password to login in json format in request body."
    );
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return this.sendResponse(
        res,
        400,
        "Authentication failed",
        undefined,
        "Email and password are required"
      );
    }

    const existingUser = await this.prisma.api_users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return this.sendResponse(
        res,
        400,
        "Authentication failed",
        undefined,
        "Incorrect email"
      );
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return this.sendResponse(
        res,
        400,
        "Authentication failed",
        undefined,
        "Incorrect password"
      );
    }

    const jwt = new JWT();
    const token = await jwt.createToken(existingUser.id, existingUser.role);

    console.info("API user logged in");
    return this.sendResponse(res, 200, "Login successful", {
      access_token: token,
      message:
        "Please copy this Access_Token and paste it in your HTTP auth bearer token.",
    });
  };
}
