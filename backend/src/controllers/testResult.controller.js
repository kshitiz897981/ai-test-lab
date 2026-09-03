import testResultModel from "../models/testResult.model.js";

export const getProjectTestResults = async (req, res) => {
    try {
        const { id } = req.params;

       const latestResult = await testResultModel.findOne({
    project: project._id,
    runId: { $exists: true }
}).sort({
    createdAt: -1
});

let results = [];

if (latestResult) {
    results = await testResultModel.find({
        project: project._id,
        runId: latestResult.runId
    }).sort({
        createdAt: 1
    });
}

        const total = results.length;

        const passed = results.filter(
            result => result.status === "PASSED"
        ).length;

        const failed = results.filter(
            result => result.status === "FAILED"
        ).length;

        const executionTimes = results
            .map(result => result.executionTime)
            .filter(time => typeof time === "number");

        const averageExecutionTime =
            executionTimes.length > 0
                ? Math.round(
                    executionTimes.reduce(
                        (sum, time) => sum + time,
                        0
                    ) / executionTimes.length
                )
                : 0;

        return res.status(200).json({
            total,
            passed,
            failed,
            averageExecutionTime,
            results
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch test results",
            error: error.message
        });
    }
};