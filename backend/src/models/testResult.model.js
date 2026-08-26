import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "project",
            required: true
        },

        testCase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "testCase",
            required: true
        },

        status: {
            type: String,
            enum: ["PASSED", "FAILED"],
            required: true
        },

        expectedOutput: {
            type: String,
            required: true
        },

        actualOutput: {
            type: String,
            required: true
        },
        runId: {
    type: String,
    required: true
},

        error: {
            type: String,
            default: null
        },

        executionTime: {
            type: Number,
            default: 0
        },
        failureAnalysis: {
    reason: String,
    severity: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"]
    },
    suggestedFix: String
}
    },
    {
        timestamps: true
    }
);

testResultSchema.index({
    project: 1,
    runId: 1
});

const testResultModel = mongoose.model("testResult", testResultSchema);

export default testResultModel;