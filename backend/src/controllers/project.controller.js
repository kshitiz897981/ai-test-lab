import projectModel from "../models/project.model.js";
import testCaseModel from "../models/testCase.model.js";
import testResultModel from "../models/testResult.model.js";


export const createProject = async (req, res) => {
    try {
        const { name, description, githubUrl, language,targetUrl } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await projectModel.create({
            name,
            description,
            githubUrl,
            language,
            targetUrl,
              user: req.user._id,
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create project",
            error: error.message
        });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await projectModel.find({ user: req.user._id }).sort({ createdAt: -1 });//-1 gets newest projects first

        return res.status(200).json({
            projects
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};

export const getProject = async (req, res) => {
    try {
        const { id } = req.params;

         const project = await projectModel.findOne({
        _id: id,
        user: req.user._id
          });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch project",
            error: error.message
        });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Delete project
        await projectModel.findByIdAndDelete(id);

        // Delete all generated test cases belonging to this project
        await testCaseModel.deleteMany({
            project: id
        });

        // Delete all execution results belonging to this project
        await testResultModel.deleteMany({
            project: id
        });

        return res.status(200).json({
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error("DELETE PROJECT ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete project",
            error: error.message
        });
    }
};

export const getProjectTestCases = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const testCases = await testCaseModel
            .find({ project: id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            total: testCases.length,
            testCases
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch test cases",
            error: error.message
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findByIdAndUpdate(
            id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update project",
            error: error.message
        });
    }
};

export const getProjectTests = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const testCases = await testCaseModel.find({
            project: project._id
        });

        const results = await testResultModel.find({
            project: project._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            testCases,
            results
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to load project tests",
            error: error.message
        });
    }
};

export const getProjectAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const analytics = await testResultModel.aggregate([
            {
                $match: {
                    project: project._id,
                    runId: { $ne: null }
                }
            },

            {
                $group: {
                    _id: "$runId",

                    total: {
                        $sum: 1
                    },

                    passed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "PASSED"] },
                                1,
                                0
                            ]
                        }
                    },

                    failed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "FAILED"] },
                                1,
                                0
                            ]
                        }
                    },

                    totalExecutionTime: {
                        $sum: "$executionTime"
                    },

                    startedAt: {
                        $min: "$createdAt"
                    }
                }
            },

            {
                $sort: {
                    startedAt: 1
                }
            }
        ]);

        // Overall statistics
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        let totalExecutionTime = 0;

        analytics.forEach(run => {
            totalTests += run.total;
            totalPassed += run.passed;
            totalFailed += run.failed;
            totalExecutionTime += run.totalExecutionTime;
        });

        const totalRuns = analytics.length;

        const overallPassRate = totalTests
            ? Math.round(
                (totalPassed / totalTests) * 100
            )
            : 0;

        const averageExecutionTime = totalTests
            ? Math.round(
                totalExecutionTime / totalTests
            )
            : 0;

        // Run-by-run trend
        const trend = analytics.map((run, index) => ({
            runNumber: index + 1,
            runId: run._id,
            total: run.total,
            passed: run.passed,
            failed: run.failed,

            passRate: run.total
                ? Math.round(
                    (run.passed / run.total) * 100
                )
                : 0,

            executionTime: run.totalExecutionTime,

            averageExecutionTime: run.total
                ? Math.round(
                    run.totalExecutionTime / run.total
                )
                : 0,

            startedAt: run.startedAt
        }));

        return res.status(200).json({
            message: "Project analytics fetched successfully",

            summary: {
                totalRuns,
                totalTests,
                totalPassed,
                totalFailed,
                overallPassRate,
                averageExecutionTime
            },

            trend
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch project analytics",
            error: error.message
        });
    }
};

export const deleteTestCase = async (req, res) => {
    try {
        const { id, testId } = req.params;

      

        const testCase = await testCaseModel.findOne({
            _id: testId,
            project: id
        });

        if (!testCase) {
            return res.status(404).json({
                message: "Test case not found"
            });
        }

        await testCaseModel.deleteOne({
            _id: testId,
            project: id
        });

        return res.status(200).json({
            message: "Test case deleted successfully",
            testId
        });

    } catch (error) {
        console.error("DELETE TEST ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete test case",
            error: error.message
        });
    }
};

export const deleteProjectTests = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await testCaseModel.deleteMany({
            project: id
        });

        return res.status(200).json({
            message: "Project tests deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("DELETE PROJECT TESTS ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete project tests",
            error: error.message
        });
    }
};

export const deleteTestResult = async (req, res) => {
    try {
        const { id, resultId } = req.params;

        const result = await testResultModel.findOneAndDelete({
            _id: resultId,
            project: id
        });

        if (!result) {
            return res.status(404).json({
                message: "Test result not found"
            });
        }

        return res.status(200).json({
            message: "Test result deleted successfully"
        });

    } catch (error) {
        console.error("DELETE TEST RESULT ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete test result",
            error: error.message
        });
    }
};

export const deleteProjectResults = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await testResultModel.deleteMany({
            project: id
        });

        return res.status(200).json({
            message: "Project execution results deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("DELETE PROJECT RESULTS ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete execution results",
            error: error.message
        });
    }
};

