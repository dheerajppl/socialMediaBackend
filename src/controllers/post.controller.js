import { dbMethods, helperUtils } from "../utils/index.js";
import constants from "../utils/constants.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import dbModels from "../utils/db.models.js";
import { query } from "express";
import { populate } from "dotenv";
import fileService from "../services/file.service.js";
const { HttpStatus } = constants;

const addNewPost = async (req, res) => {
    try {
        if (!req.body.fileId) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.successRes("fileId is required", {}, HttpStatus.BAD_REQUEST));
        };

        req.body.author = req.user._id;
        const newPost = await dbMethods.insertOne({
            collection: dbModels.Post,
            document: req.body
        });
        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: req.user._id },
            update: { $addToSet: { posts: newPost._id } }
        })
        res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully Created"))
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const getAllPost = async (req, res) => {
    try {
        let query = {};
        let page = 1,
            limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;
        let result = await dbMethods.paginate({
            collection: dbModels.Post,
            query: query,
            options: {
                populate: [
                    { path: "author", select: "username" },
                    { path: "comments", populate: { path: "author", select: "username" } }
                ],
                sort: { createdAt: -1 },
                lean: true,
                page,
                limit,
            }
        })
        const fileIds = result.docs
            .filter(cat => cat.fileId)
            .map(cat => cat.fileId);
        if (fileIds.length > 0) {
            const files = await fileService.getFilesByIds(fileIds);

            result.docs = result.docs.map(cat => {
                if (!cat.fileId) return cat;

                const file = files.find(f => f._id.toString() === cat.fileId.toString());

                if (file) {
                    return {
                        ...cat,
                        image: file.url,
                    };
                }
                return cat;
            });
        }
        return res
            .status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));

    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const getUserPost = async (req, res) => {
    try {
        let query = {};
        query.author = req.user._id
        let page = 1,
            limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;
        const result = dbMethods.paginate({
            collection: dbModels.Post,
            query: query,
            options: {
                sort: { createdAt: -1 },
                lean: true,
                page,
                limit,
            }
        })
        return res
            .status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));

    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const likePost = async (req, res) => {
    try {
        const _id = req.user._id;
        const { postId } = req.params.id;
        const Post = await dbMethods.findOne({
            collection: dbModels.Post,
            query: { _id: postId }
        })
        if (!Post) {
            return res.status(HttpStatus.NOT_FOUND)
                .send(helperUtils.successRes("Post not found", {}, HttpStatus.NOT_FOUND));
        }
        await dbMethods.updateOne({
            collection: dbModels.Post,
            query: { _id: postId },
            update: { $addToSet: { likes: _id } }
        })
        return res
            .status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully Liked"));

    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const disLikePost = async (req, res) => {
    try {
        const _id = req.user._id;
        const { postId } = req.params.id;
        const Post = await dbMethods.findOne({
            collection: dbModels.Post,
            query: { _id: postId }
        })
        if (!Post) {
            return res.status(HttpStatus.NOT_FOUND)
                .send(helperUtils.successRes("Post not found", {}, HttpStatus.NOT_FOUND));
        }
        await dbMethods.updateOne({
            collection: dbModels.Post,
            query: { _id: postId },
            update: { $pull: { likes: _id } }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully DisLiked"));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const addComment = async (req, res) => {
    try {
        req.body.author = req.user._id;
        if (!req.body.text) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.successRes("Comment text is required", {}, HttpStatus.BAD_REQUEST));
        }
        const Post = await dbMethods.findOne({
            collection: dbModels.Post,
            query: { _id: req.body.post }
        })
        if (!Post) {
            return res.status(HttpStatus.NOT_FOUND)
                .send(helperUtils.successRes("Post not found", {}, HttpStatus.NOT_FOUND));
        }
        const comment = await dbMethods.insertOne({
            collection: dbModels.Comment,
            documents: req.body
        })
        await dbMethods.updateOne({
            collection: dbModels.Post,
            query: { _id: req.body.post },
            update: { $push: { comments: comment?._id } }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully Created"));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const getCommentsOfPost = async (req, res) => {
    try {

        const result = await dbMethods.find({
            collection: dbModels.Comment,
            query: { post: req.params.id }
        })

        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully Created", result));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const deletePost = async (req, res) => {
    try {
        const Post = await dbMethods.findOne({
            collection: dbModels.Post,
            query: { _id: req.params.id }
        })
        if (!Post) {
            return res.status(HttpStatus.NOT_FOUND)
                .send(helperUtils.errorRes("Post not found", {}, HttpStatus.NOT_FOUND));
        }
        if (Post.author.toString() !== req.user._id) {
            return res.status(HttpStatus.UNAUTHORIZED)
                .send(helperUtils.errorRes("Unauthorized for post delte", {}, HttpStatus.UNAUTHORIZED));
        }

        const result = await dbMethods.deleteOne({
            collection: dbModels.Post,
            query: { _id: req.params.id }
        })
        await dbMethods.deleteMany({
            collection: dbModels.Comment,
            query: { post: req.params.id }
        })
        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: req.user._id },
            update: { $pull: { posts: req.params.id } }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", result));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send(helperUtils.errorRes("Bad Request", {}, HttpStatus.INTERNAL_SERVER_ERROR));

    }
}

const bookmarksPost = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { _id: postId } = req.params;

        if (userId === postId) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("You can' bookmarks yourself"));
        }

        const [user, post] = await Promise.all([
            dbMethods.findOne({ collection: dbModels.User, query: { _id: userId } }),
            dbMethods.findOne({ collection: dbModels.Post, query: { _id: postId } })
        ]);

        if (!user || !post) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Not found"));
        }

        const isbookmark = user.bookmarks.includes(postId);

        if (isbookmark) {
            dbMethods.updateOne({
                collection: dbModels.User,
                query: { _id: userId },
                update: { $pull: { bookmarks: postId } }
            });
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Successfully unbookmarked"));
        } else {
            dbMethods.updateOne({
                collection: dbModels.User,
                query: { _id: userId },
                update: { $addToSet: { bookmarks: postId } }
            });
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Successfully bookmarked"));
        }
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.errorRes("Bad request", error.message, HttpStatus.BAD_REQUEST));
    }

}

export default {
    addNewPost,
    getAllPost,
    getUserPost,
    likePost,
    disLikePost,
    addComment,
    getCommentsOfPost,
    deletePost,
    bookmarksPost
};