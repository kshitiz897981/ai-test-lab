import express from "express";

import {
    getProjectTestResults
} from "../controllers/testResult.controller.js";

const router = express.Router();

router.get(
    "/project/:id",
    getProjectTestResults
);

export default router;