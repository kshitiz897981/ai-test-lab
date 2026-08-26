import { Octokit } from "octokit";
import "dotenv/config";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});



export const getRepository = async (owner, repo) => {
    const response = await octokit.rest.repos.get({
        owner,
        repo
    });

    return response.data;
};

export const getRepositoryFiles = async (owner, repo) => {
    const response = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: "HEAD",
        recursive: "true"
    });

    return response.data.tree;
};

const ignoredPaths = [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    ".git/",
    "vendor/",
    "fixtures/"
];

const allowedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".go",
    ".cpp",
    ".c"
];

export const filterSourceFiles = (files) => {
    return files.filter((file) => {

        // Only actual files
        if (file.type !== "blob") {
            return false;
        }

        // Ignore unwanted directories
        if (ignoredPaths.some((path) => file.path.includes(path))) {
            return false;
        }

        // Only source-code extensions
        return allowedExtensions.some((extension) =>
            file.path.endsWith(extension)
        );
    });
};

export const getFileContent = async (owner, repo, path) => {
    const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
    });

    if (Array.isArray(response.data)) {
        throw new Error("Path is a directory, not a file");
    }

    if (response.data.type !== "file") {
        throw new Error("Requested path is not a file");
    }

    const content = Buffer
        .from(response.data.content, "base64")
        .toString("utf-8");

    return content;
};