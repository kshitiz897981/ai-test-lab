import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import projectRoutes from "./routes/project.routes.js";
import githubRoutes from "./routes/github.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import testResultRouter from "./routes/testResult.routes.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";



dotenv.config();

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);


app.use(express.json());

connectDB();

app.use(cookieParser());

app.use("/api/projects", projectRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/projects", analysisRoutes);
app.use(
    "/api/test-results",
    testResultRouter
);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
    res.json({
        message: "AI Test Lab API is running"
    });
});







const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});