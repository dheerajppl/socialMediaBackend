import { Router } from "express";

const router = Router();

import { auth } from "../middlewares/auth.js"
import messageController from "../controllers/message.controller.js";


router.post("/send/:id",auth,messageController.sendMessage);

router.get("/all/:id", auth, messageController.getMessage);


export default router;