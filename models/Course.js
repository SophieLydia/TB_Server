const mongoose = require('mongoose');

const courseSchema = mongoose.Schema (
    {
        themeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theme",
            required: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        cost: {
            type: Number,
            default: 0.0
        },
        absence:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child"
        }],
    },
    {timestamps: true}
);

module.exports = mongoose.model("Course", courseSchema);