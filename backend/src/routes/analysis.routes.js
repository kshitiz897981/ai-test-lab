import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
    analyzeRepository
} from "../controllers/analysis.controller.js";

const router = express.Router();

router.post("/:id/analyze",authMiddleware, analyzeRepository);



export default router;