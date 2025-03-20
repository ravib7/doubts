const mongoose = require("mongoose")

module.exports = mongoose.model("user", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    profile: { type: String, required: true },
    mobile: { type: String },
    password: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true }))