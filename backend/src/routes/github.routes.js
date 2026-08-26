import express from "express";

import {
    connectGithubRepository
} from "../controllers/github.controller.js";

const router = express.Router();

router.post("/:id/connect", connectGithubRepository);

export default router;