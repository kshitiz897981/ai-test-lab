import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "project",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        input: {
    method: {
        type: String,
        required: true
    },

    path: {
        type: String,
        required: true
    },

    body: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    headers: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
},

expectedOutput: {
    status: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    body: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
},

        priority: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW"],
            required: true
        },

        sourceFile: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const testCaseModel = mongoose.model("testCase", testCaseSchema);

export default testCaseModel;