import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const router = express.Router();

// School student registration
router.post("/register", async (req, res) => {
    try {
        const {
            fullName,
            schoolName,
            grade,
            email,
            password,
            confirmPassword,
            language,
            terms
        } = req.body;

        // Check required fields
        if (
            !fullName ||
            !schoolName ||
            !grade ||
            !email ||
            !password ||
            !confirmPassword ||
            !language
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }

        // Validate text fields
        if (fullName.trim().length < 12 || fullName.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Full name must contain 12-100 characters."
            });
        }

        if (schoolName.trim().length < 12 || schoolName.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "School name must contain 12-100 characters."
            });
        }

        if (grade.trim().length < 1 || grade.trim().length > 30) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid grade."
            });
        }

        // Validate email
        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            normalizedEmail.length < 12 ||
            normalizedEmail.length > 50 ||
            !emailPattern.test(normalizedEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Validate password
        const passwordPattern =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,12}$/;

        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain 8-12 characters, including a letter, number and symbol."
            });
        }

        // Confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        // Validate language
        if (!["en", "si", "ta"].includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid language."
            });
        }

        // Validate terms
        if (terms !== true) {
            return res.status(400).json({
                success: false,
                message: "Please accept the Terms and Conditions."
            });
        }

        // Check existing account
        const existingStudent = await Student.findOne({
            email: normalizedEmail
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create student account
        const student = await Student.create({
            fullName: fullName.trim(),
            schoolName: schoolName.trim(),
            grade: grade.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            language
        });

        return res.status(201).json({
            success: true,
            message: "School student account created successfully!",
            student: {
                id: student._id,
                fullName: student.fullName,
                email: student.email,
                grade: student.grade
            }
        });

    } catch (error) {
        console.error("Student registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during registration."
        });
    }
});

// Student Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find student and include hidden password field
        const student = await Student.findOne({
            email: normalizedEmail
        }).select("+password");

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { studentId: student._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            student: {
                id: student._id,
                fullName: student.fullName,
                email: student.email,
                schoolName: student.schoolName,
                grade: student.grade,
                language: student.language
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
});

export default router;