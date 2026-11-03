import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";
//import studyRoutes from "./src/routes/studyRoutes.js";

dotenv.config();

const app = express();

// Middleware (must come before routes)
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/students", studentRoutes);
//app.use("/api/study", studyRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LearnPath AI server is running!"
    });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
