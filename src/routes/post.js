import { Router } from "express";

const router = Router();

import { auth } from "../middlewares/auth.js"
import postController from "../controllers/post.controller.js";
import uploadad from "../middlewares/multer.js";

router.post("/create",auth,  postController.addNewPost);

router.post("/",auth,postController.getAllPost);

router.post("/list", auth, postController.getUserPost);

router.delete("/:id", auth, postController.deletePost);

router.get("/like/:id", auth, postController.likePost);

router.get("/dislike/:id", auth,  postController.disLikePost);

router.post("/comment/create", auth, postController.addComment);

router.get("/comment/list/:id", auth, postController.getCommentsOfPost);


router.get("/bookmarks/:id", auth, postController.bookmarksPost);




export default router;