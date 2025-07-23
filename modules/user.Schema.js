const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    number: {
        type: Number,
        required: [true, "📌 Number is required."],
        unique: true,
    },
    location: {
        type: String,
        default: "",
    },
    orders: {
        type: [Object],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
