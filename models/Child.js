const mongoose = require('mongoose');

const childSchema = mongoose.Schema (
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
            required: true 
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        parentalStatement: {
            type: Boolean,
            default: false
        },
        allergy:{
            type: String,
            default: "None"
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Child", childSchema);