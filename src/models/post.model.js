import mongoose from "mongoose";
import mongoosepaginate from "mongoose-paginate-v2";

const postSchema = new mongoose.Schema({
    caption: { type: String, default: ""},
    image: { type: String, required:true},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });
postSchema.plugin(mongoosepaginate);

export default postSchema;