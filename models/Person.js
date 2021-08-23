const mongoose = require('mongoose');

const personSchema = mongoose.Schema ({
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true 
        },
        phoneNumber : {
            type: String,
            required: true
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
            },
        },
        role: {          
            type: String,       
            enum: ["child", "assistant", "boss"],
            required: true      
        }                      
    },
    {timestamps: true}
);

module.exports = mongoose.model("Person", personSchema);