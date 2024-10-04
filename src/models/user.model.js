import mongoose from "mongoose";
import mongoosepaginate from "mongoose-paginate-v2";


const userSchema = new mongoose.Schema({
    username: { type: String, default: "", unique:true}, 
    password: { type: String, default: "" },
    email: { type: String, default: "", unique:true },
    profilePicture: { type: String, default: ""},
    bio: { type: String, default: ""},
    gender: { type: String, enum: [ 'male', 'female']},
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    role: { type: String, default: "User" },
    isActive: { type: Boolean, default: false },
    isDel: { type: Boolean, default: false },
    lastInActiveTime: { type: String, default: '' }
}, { timestamps: true })
userSchema.plugin(mongoosepaginate);

export default userSchema;