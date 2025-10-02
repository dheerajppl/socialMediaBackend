import { Router } from "express";
const router = Router();
import FileController from "../controllers/fileController.js"
import { auth } from "../middlewares/auth.js"


router.get('/generate-presigned-url', auth, FileController.generatePresignedUrl);

router.get('/get/:fileId', auth, FileController.getFile);
router.post('/get/files', auth, FileController.getFilesByIds);
router.delete('/delete/:fileId', auth, FileController.deleteFile);

export default router;
