const mongoose = require('mongoose');

const assistantSchema = mongoose.Schema (
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
            required: true
        },
        cantonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Canton",
            required: true
        },
        salary: {
            type: Number,
            default: 20.00
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Assistant", assistantSchema);