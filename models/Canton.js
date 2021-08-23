const mongoose = require('mongoose');

const cantonSchema = mongoose.Schema (
    {
        name: {
            type: String,
            required: true
        },
        budget: {
            type: Number,
            default: 0.0
        },
        address : {
            postCode : {
                type: Number,
                required: true
            },
            city : {
                type: String,
                required: true
            },
            streetName : {
                type: String,
                required: true
            },
            streetNumber : {
                type: Number,
                required: true
            }
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Canton", cantonSchema);