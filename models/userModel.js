const mongoose = require("mongoose");

const useSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, minLength: 3, maxLength: 30 },
        email: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 200,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 1024,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.model("User", useSchema);

module.exports = userModel;
