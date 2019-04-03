const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
    {
        token: String,
        comments: String,
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        emailDraftTo: String,
        toDiscardedStatus: {
            type: Boolean,
            default: false
        },
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        fromDiscardedStatus: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["Draft", "Delivered", "Accepted", "Refused", "Read"],
            default: "Draft"
        },
        type: {
            type: String,
            enum: ["Anonymous", "Signed"],
            default: "Signed"
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