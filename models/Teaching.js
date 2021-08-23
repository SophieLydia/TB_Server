const mongoose = require('mongoose');

const teachingSchema = mongoose.Schema (
    {
        assistantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assistant",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Teaching", teachingSchema);