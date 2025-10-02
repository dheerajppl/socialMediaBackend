import dbModels from "../utils/db.models.js";
import db from "../models/index.js";

class FileRepository {
  static async saveFile(userId, fileData) {
    try {
      return await db.File.create({
        createdBy: userId,
        ...fileData,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  static async updateFileUploadStatus(fileId, status) {
    try {
      return await db.File.updateOne(
        { _id: fileId },
        { status: status }
      );
    } catch (error) {
      console.error('Error updating file upload status:', error);
      throw error;
    }
  }

  static async getFileById(fileId) {
    try {
      return await db.File.findById(fileId);
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      throw error;
    }
  }
  static async getFilesByIds(fileIds) {
    try {
      return await db.File.find({ _id: { $in: fileIds } });
    } catch (error) {
      console.error('Error fetching files by IDs:', error);
      throw error;
    }
  }

  static async deleteFile(fileId) {
    try {
      return await db.File.findByIdAndDelete(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export default FileRepository;
