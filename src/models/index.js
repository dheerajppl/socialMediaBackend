import mongoose from "mongoose";

import dbModels from "../utils/db.models.js";
import userSchema  from "./user.model.js";
import postSchema from "./post.model.js";
import commentSchema from "./comment.model.js";
import messageSchema from "./message.model.js"
import conversationSchema from "./conversation.model.js";

const db = {

    User: mongoose.model(dbModels.User, userSchema),
    Post: mongoose.model(dbModels.Post, postSchema),
    Comment: mongoose.model(dbModels.Comment, commentSchema),
    Message: mongoose.model(dbModels.Message, messageSchema),
    Conversation: mongoose.model(dbModels.Conversation, conversationSchema)
}

export default db;  //export the db object