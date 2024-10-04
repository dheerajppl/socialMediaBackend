import { Router } from "express";

const router = Router();

import { auth } from "../middlewares/auth.js"
import userController from "../controllers/user.controller.js"
import uploadad from "../middlewares/multer.js";

router.post("/register", userController.userRegister)

router.post("/login", userController.userLogin)

router.post("/logout", userController.logoutUser)

router.get("/profile/:id", auth, userController.getProfile)

router.post("/profile/edit", auth, uploadad.single("pofilePicture"), userController.editProfile)

router.get("/suggested", auth, userController.getSuggestedUsers)

router.get("/followorunfollow/:id", auth, userController.followOrUnfollow)



export default router;