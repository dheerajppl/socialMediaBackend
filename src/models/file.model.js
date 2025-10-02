import mongoose from "mongoose";
import { FileUploadStatusType } from '../config/enums.js'

const FileSchema = new mongoose.Schema({
    mimeType: { type: String },
    fileName: { type: String },
    size: { type: String },
    s3BucketKey: { type: String },
    status: {
        type: String,
        enum: Object.values(FileUploadStatusType),
        default: FileUploadStatusType.UPLOADING
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true, strict: false });

export default FileSchema