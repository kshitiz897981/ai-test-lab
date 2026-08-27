import projectModel from "../models/project.model.js";


import { createCodeDocuments } from "../services/code.service.js";
import { createVectorStore } from "../services/vector.service.js";
import { generateTestCases } from "../services/llm.service.js";
import testCaseModel from "../models/testCase.model.js";
import { analyzeFailure } from "../services/failureAnalysis.service.js";

import testResultModel from "../models/testResult.model.js";
import { runTestCase } from "../services/testRunner.service.js";
import crypto from "crypto";

import {
    getRepositoryFiles,
    filterSourceFiles,
    getFileContent
} from "../services/github.service.js";


export const analyzeRepository = async (req, res) => {
    try {
        const projectId = req.params.id;

        // ===============================
        // FIND PROJECT
        // ===============================

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project.githubOwner || !project.githubRepo) {
            return res.status(400).json({
                message: "GitHub repository is not connected"
            });
        }


        // ===============================
        // GET GITHUB FILES
        // ===============================

        const files = await getRepositoryFiles(
            project.githubOwner,
            project.githubRepo
        );

        const sourceFiles = filterSourceFiles(files).slice(0, 30);


        // ===============================
        // GET FILE CONTENT
        // ===============================

        const codeFiles = [];

        for (const file of sourceFiles) {

            const content = await getFileContent(
                project.githubOwner,
                project.githubRepo,
                file.path
            );

            codeFiles.push({
                path: file.path,
                content
            });
        }


        // ===============================
        // CREATE LANGCHAIN DOCUMENTS
        // ===============================

        const documents = await createCodeDocuments(codeFiles);

        const vectorStore = await createVectorStore(documents);


        // ===============================
        // RAG QUERIES
        // ===============================

        const queries = [
            "authentication login logout register",
            "authorization middleware protected routes",
            "API validation request body validation",
            "CRUD create read update delete",
            "database models queries operations",
            "business logic services",
            "API routes endpoints",
            "error handling exceptions",
            "HTTP responses status codes"
        ];


        const allResults = [];

        for (const query of queries) {

            const results = await vectorStore.similaritySearch(
                query,
                2
            );

            allResults.push(...results);
        }


        // ===============================
        // REMOVE DUPLICATE DOCUMENTS
        // ===============================

        const uniqueDocuments = Array.from(
            new Map(
                allResults.map(doc => [
                    doc.pageContent,
                    doc
                ])
            ).values()
        );


        // Limit context sent to LLM
        const limitedDocuments = uniqueDocuments.slice(0, 15);

        const relevantCode = limitedDocuments
            .map(doc => doc.pageContent)
            .join("\n\n");


        // ===============================
        // GET EXISTING TESTS
        // ===============================

        const existingTests = await testCaseModel.find({
            project: project._id
        });


        // Send lightweight information about
        // existing tests to the LLM
        const existingTestSummary = existingTests.map(test => ({
            method: test.input?.method,
            path: test.input?.path,
            expectedStatus: test.expectedOutput?.status
        }));


        // ===============================
        // GENERATE TESTS
        // ===============================

        const testCases = await generateTestCases(
            relevantCode,
            existingTestSummary
        );


        // ===============================
        // REMOVE DUPLICATE TESTS
        // ===============================

        const existingKeys = new Set(
            existingTests.map(test => getBehaviorKey(test))
        );


        const newTests = testCases.testCases.filter(test => {

            const key = getBehaviorKey(test);

            if (existingKeys.has(key)) {
                return false;
            }

            existingKeys.add(key);

            return true;
        });


        // ===============================
        // LOG COUNTS
        // ===============================

        console.log(
            "Existing tests:",
            existingTests.length
        );

        console.log(
            "Generated tests:",
            testCases.testCases.length
        );

        console.log(
            "New tests:",
            newTests.length
        );

        console.log(
            "Duplicates:",
            testCases.testCases.length - newTests.length
        );


        // ===============================
        // SAVE ONLY NEW TESTS
        // ===============================

        
        let insertedTests=[]
        if (newTests.length > 0) {

            insertedTests = await testCaseModel.insertMany(
                newTests.map(test => ({
                    ...test,
                    project: project._id
                }))
            );
        }


        // ===============================
        // VERIFY MONGODB IDS
        // ===============================

        console.log(
            "SAVED TEST IDS:",
            insertedTests.map(test =>
                test._id.toString()
            )
        );


        // ===============================
        // ANALYSIS DATA
        // ===============================

        const analysis = {

            totalFiles: codeFiles.length,

            totalChunks: documents.length,

            sourceFiles: codeFiles.map(
                file => file.path
            ),

            rag: {
                enabled: true,
                queries,
                relevantChunks: limitedDocuments.length
            },

            testGeneration: {
                totalTests:
                    testCases.testCases?.length || 0
            }
        };


        // ===============================
        // RESPONSE
        // ===============================

        return res.status(200).json({

            message:
                "Repository analyzed successfully",

            analysis: {

                ...analysis,

                testGeneration: {

                    generatedTests:
                        testCases.testCases.length,

                    newTests:
                        insertedTests.length,

                    duplicateTests:
                        testCases.testCases.length -
                        insertedTests.length
                }
            },

            testCases: {

                // IMPORTANT:
                // Return savedTests because these
                // contain MongoDB _id values

                testCases: insertedTests
            }
        });


    } catch (error) {

        console.error(
            "ANALYZE REPOSITORY ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to analyze repository",

            error:
                error.message
        });
    }
};

const getBehaviorKey = (test) => {

    const method =
        test.input?.method?.toUpperCase() || "";

    const path =
        test.input?.path || "";

    const status =
        test.expectedOutput?.status || "";

    const description = (
        test.description ||
        test.name ||
        ""
    ).toLowerCase();


    let behavior = "generic";


    if (
        description.includes("authentication") ||
        description.includes("without authentication") ||
        description.includes("without auth") ||
        description.includes("unauthorized")
    ) {
        behavior = "unauthenticated";
    }

    else if (
        description.includes("missing") ||
        description.includes("required")
    ) {
        behavior = "missing-input";
    }

    else if (
        description.includes("invalid")
    ) {
        behavior = "invalid-input";
    }

    else if (
        description.includes("duplicate") ||
        description.includes("idempotency") ||
        description.includes("already")
    ) {
        behavior = "duplicate";
    }

    else if (
        description.includes("non-existent") ||
        description.includes("not found")
    ) {
        behavior = "not-found";
    }

    else if (
        description.includes("success") ||
        description.includes("successful") ||
        description.includes("valid")
    ) {
        behavior = "success";
    }


    return `${method}|${path}|${status}|${behavior}`;
};

export const runProjectTests = async (req, res) => {
    console.log("🔥 RUN PROJECT TESTS HIT");
    try {
        const { id } = req.params;
        const runId = crypto.randomUUID();
       

       console.log("🔥 NEW RUN ID:", runId);
         

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project.targetUrl) {
            return res.status(400).json({
                message: "Project target URL is not configured"
            });
        }

        const testCases = await testCaseModel.find({
            project: project._id
        });

        if (testCases.length === 0) {
            return res.status(404).json({
                message: "No test cases found for this project"
            });
        }

        const results = [];

        for (const testCase of testCases) {
            const actual = await runTestCase(
                testCase,
                project.targetUrl
            );

   

    const expected = testCase.expectedOutput;

    const passed =
    actual.status === expected.status &&
    JSON.stringify(actual.body) === JSON.stringify(expected.body);

    let failureAnalysis = null;

    if (!passed) {
    failureAnalysis = await analyzeFailure({
        testCase,
        expected,
        actual
    });
  }

     console.log("CREATING TEST RESULT:", {
    testCase: testCase._id,
    runId
});

            const result = await testResultModel.create({
                project: project._id,
                testCase: testCase._id,
                status: passed ? "PASSED" : "FAILED",
                runId,
                expectedOutput: JSON.stringify(
                    testCase.expectedOutput
                ),
                actualOutput: JSON.stringify(actual),
                error: actual.error || null,
                executionTime: actual.executionTime,
                failureAnalysis
            });

            results.push({
    ...result.toObject(),
    testCaseName: testCase.name
});
        }

        const passed = results.filter(
            result => result.status === "PASSED"
        ).length;

        const failed = results.filter(
            result => result.status === "FAILED"
        ).length;

        return res.status(200).json({
            message: "Tests executed successfully",
            total: results.length,
            passed,
            failed,
            results
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to execute tests",
            error: error.message
        });
    }
};

export const getTestRuns = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const runs = await testResultModel.aggregate([
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

                    startedAt: {
                        $min: "$createdAt"
                    }
                }
            },

            {
                $sort: {
                    startedAt: -1
                }
            }
        ]);

        // Format the aggregation result
        const formattedRuns = runs.map(run => ({
            runId: run._id,
            total: run.total,
            passed: run.passed,
            failed: run.failed,
            passRate: run.total
                ? Math.round(
                    (run.passed / run.total) * 100
                )
                : 0,
            startedAt: run.startedAt
        }));

        return res.status(200).json({
            message: "Test runs fetched successfully",
            runs: formattedRuns
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch test runs",
            error: error.message
        });
    }
};

export const getTestRunResults = async (req, res) => {
    try {
        const { id, runId } = req.params;

        const project = await projectModel.findById(id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const results = await testResultModel
            .find({
                project: project._id,
                runId: runId
            })
            .populate("testCase");

        if (results.length === 0) {
            return res.status(404).json({
                message: "No results found for this test run"
            });
        }

        return res.status(200).json({
            message: "Test run results fetched successfully",
            runId,
            total: results.length,
            passed: results.filter(
                result => result.status === "PASSED"
            ).length,
            failed: results.filter(
                result => result.status === "FAILED"
            ).length,
            results
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch test run results",
            error: error.message
        });
    }
};