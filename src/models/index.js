import mongoose from "mongoose";

import dbModels from "../utils/db.models.js";
import userSchema  from "./user.model.js";
import postSchema from "./post.model.js";
import commentSchema from "./comment.model.js";
import messageSchema from "./message.model.js"
import conversationSchema from "./conversation.model.js";
import FileSchema from "./file.model.js"

const db = {

    User: mongoose.model(dbModels.User, userSchema),
    Post: mongoose.model(dbModels.Post, postSchema),
    Comment: mongoose.model(dbModels.Comment, commentSchema),
    Message: mongoose.model(dbModels.Message, messageSchema),
    Conversation: mongoose.model(dbModels.Conversation, conversationSchema),
    File: mongoose.model(dbModels.File, FileSchema)
}

export default db;  //export the db object