import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
             },
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        githubUrl: {
            type: String,
            trim: true
        },

        githubOwner: {
            type: String,
            trim: true
        },

        githubRepo: {
            type: String,
            trim: true
        },

        language: {
            type: String,
            trim: true
        },
        targetUrl: {
           type: String,
           required: false
}
    },
    {
        timestamps: true
    }
);

const projectModel = mongoose.model("Project", projectSchema);

export default projectModel;