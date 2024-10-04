import constants  from "../utils/constants.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import dbModels  from "../utils/db.models.js";
import { query } from "express";
import { populate } from "dotenv";
import { dbMethods, helperUtils } from "../utils/index.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
const { HttpStatus } = constants;

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const { message } = req.body;
        if(!req.body.message) {
            return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.errorRes('Message is require',{},));
        }

        let conversation = await dbMethods.findOne({
            collection: dbModels.Conversation,
            query: {
                participants: {$all: [senderId, receiverId]}
            }
        })
        if (!conversation) {
            conversation = await dbMethods.insertOne({
                collection: dbModels.Conversation,
                document: {
                    participants: [senderId, receiverId],
                }
            })
        }  
        const newMessage = await dbMethods.insertOne({
            collection: dbModels.Message,
            document: {
                senderId,
                receiverId,
                message,
            }
        })
        if(newMessage) {
            await dbMethods.updateOne({
                collection: dbModels.Conversation,
                query: {
                    _id: conversation._id
                },
                update: {
                    $push: {
                        messages: newMessage._id
                    }
                }   
            })
        }

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }
        res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully Sent", newMessage))
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
           .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));
        
    }
}

const getMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        let conversation = await dbMethods.findOne({
            collection: dbModels.Conversation,
            query: {
                participants: {$all: [senderId, receiverId]}
            },
            populate:[
                {path: "messages" }
            ]
        })
        if (!conversation) {
            res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get", []))
        }  
        
        res.status(HttpStatus.OK)
          .send(helperUtils.successRes("Successfully Sent", conversation?.messages))
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
           .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));
        
    }
}


export default  {
    sendMessage,
    getMessage
}