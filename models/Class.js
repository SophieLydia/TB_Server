const mongoose = require('mongoose');

const classSchema = mongoose.Schema (
    {
        cantonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Canton",
            required: true
        },
        periode: {
            type: String,
            enum: ["morning", "afternoon"],
            required: true
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Class", classSchema);