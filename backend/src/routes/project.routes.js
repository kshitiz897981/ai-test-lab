import express from "express";

import {
    createProject,
    getProjects,
    getProject,
    deleteProject,
    getProjectTestCases,
    updateProject,
    getProjectTests,
    getProjectAnalytics
    
} from "../controllers/project.controller.js";

import { runProjectTests,getTestRuns ,getTestRunResults} from "../controllers/analysis.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",authMiddleware, createProject);

router.get("/", authMiddleware,getProjects);

router.get("/:id", authMiddleware,getProject);

router.get("/:id/test-cases",authMiddleware, getProjectTestCases);

router.post("/:id/run-tests",authMiddleware, runProjectTests);

router.get("/:id/test-runs", authMiddleware, getTestRuns);

router.get(
    "/:id/test-runs/:runId",
    authMiddleware,
    getTestRunResults
);

router.get(
    "/:id/analytics",
    authMiddleware,
    getProjectAnalytics
);
router.patch("/:id", authMiddleware,updateProject);

router.delete("/:id", authMiddleware,deleteProject);

router.get("/:id/tests", getProjectTests);

export default router;