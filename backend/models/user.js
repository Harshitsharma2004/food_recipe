const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    isDeleted: { type: Boolean, default: false },
    isDark: { type: Boolean, default: false }
},{timestamps:true});

module.exports = mongoose.model("User",userSchema)