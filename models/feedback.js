const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
    {
        comments: String,
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ["Draft", "Delivered", "Accepted", "Refused", "Readen"],
            default: "Draft"
        },
        type: {
            type: String,
            enum: ["Anonymous", "Signed"],
            default: "Anonymous"
        },
        hierarchy: {
            type: String,
            enum: ["Downward","Upward","Pair","None of above"],
            default: "None of above"
        },
        deliveredDate: Date,
    },

    {
        timestamps: true
    }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;