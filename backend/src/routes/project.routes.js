import express from "express";

import {
    createProject,
    getProjects,
    getProject,
    deleteProject,
    getProjectTestCases,
    updateProject,
    getProjectAnalytics,
    deleteProjectTests,
    deleteTestCase,
    deleteTestResult,
    deleteProjectResults
    
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

router.delete("/:id/tests/:testId", deleteTestCase);

router.delete("/:id/tests", deleteProjectTests);

router.get("/:id/tests", getProjectTests);

router.delete(
    "/:id/test-results/:resultId",
    deleteTestResult
);

router.delete(
    "/:id/test-results",
    deleteProjectResults
);

export default router;