import projectModel from "../models/project.model.js";
import { getRepository } from "../services/github.service.js";

export const connectGithubRepository = async (req, res) => {
    try {
        const { id } = req.params;
        const { githubUrl } = req.body;

        if (!githubUrl) {
            return res.status(400).json({
                message: "GitHub URL is required"
            });
        }

        const url = new URL(githubUrl);

        if (url.hostname !== "github.com") {
            return res.status(400).json({
                message: "Invalid GitHub URL"
            });
        }

        const parts = url.pathname
            .split("/")
            .filter(Boolean);

        if (parts.length < 2) {
            return res.status(400).json({
                message: "Invalid GitHub repository URL"
            });
        }

        const owner = parts[0];
        const repo = parts[1].replace(".git", "");

        const githubRepo = await getRepository(owner, repo);

        const project = await projectModel.findByIdAndUpdate(
            id,
            {
                githubUrl,
                githubOwner: owner,
                githubRepo: repo,
                language: githubRepo.language
            },
            {
                new: true
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            message: "GitHub repository connected successfully",
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to connect GitHub repository",
            error: error.message
        });
    }
};