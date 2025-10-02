import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import FileRepository from '../repositories/file.repository.js';
import { s3Client, S3_BUCKET } from '../config/s3Bucket.js';
import { FileUploadStatusType } from '../config/enums.js';


class FileService {

  async getPreSignUploadUrl(fileName, fileType, folderName) {
    try {
      const filePath = (folderName && folderName !== "undefined") ? `${folderName}/${Date.now()}_${fileName}` : `profiles/${Date.now()}_${fileName}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filePath,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

      return { filePath, uploadUrl };
    } catch (error) {
      console.log("Error getting presigned URL:", error);
      throw error;
    }
  }
  async getFile(fileId) {
    try {
      const file = await FileRepository.getFileById(fileId);
      if (!file) {
        const error = new Error('File not found');
        error.statusCode = 404;
        throw error;
      }

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: file.s3BucketKey,
      });
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 60,
      });

      return { url: presignedUrl };
    } catch (error) {
      console.log('Error fetching file:', error);
      throw error;
    }
  }

  async saveFileInfo(userId, fileName, fileType, fileSize, filePath) {
    try {
      return await FileRepository.saveFile(
        userId,
        {
          fileName,
          size: fileSize,
          mimeType: fileType,
          s3BucketKey: filePath,
          status: FileUploadStatusType.UPLOADING,
        }
      );
    } catch (error) {
      console.log("file.service saveFileInfo", error);
      throw error;
    }
  }

  async updateFileUploadStatus(fileId, status) {
    try {

      if (!Object.values(FileUploadStatusType).includes(status) || !fileId) {
        throw new Error("Status and file ID are required to update file upload status");
      }

      return await FileRepository.updateFileUploadStatus(fileId, status);
    } catch (error) {
      console.log("file.service updateFileUploadStatus", error);
      throw error;
    }
  }

  async getFilesByIds(fileIds) {
    try {
      const files = await FileRepository.getFilesByIds(fileIds);
      // console.log('Fetched files:', files);
      const filesData = await Promise.all(
        files.map(async (file) => {
          const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: file.s3BucketKey,
          });
          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 60 * 24 * 5,
          });
          return { url: presignedUrl, _id: file._id, metadata: file };
        }),
      );
      return filesData;
    } catch (error) {
      console.log('Error fetching files:', error);
      throw new Error('Internal server error');
    }
  }
  async deleteFile(fileId) {
    try {
      const file = await FileRepository.getFileById(fileId);
      if (!file) {
        const error = new Error('File not found');
        error.statusCode = 404;
        throw error;
      }

      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: file.s3BucketKey,
      });

      await s3Client.send(command);
      return await FileRepository.deleteFile(fileId);
    } catch (error) {
      console.log('Error deleting file:', error);
      throw error;
    }
  }

  async uploadFile(userId, buffer, fileName, fileType) {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: `products/${fileName}`,
      Body: buffer,
      ContentType: fileType,
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded to S3: products/${fileName}`);

    return await FileRepository.saveFile(
      userId,
      {
        fileName,
        size: buffer.length,
        mimeType: fileType,
        s3BucketKey: `products/${fileName}`,
        status: FileUploadStatusType.UPLOADED,
      }
    );
  }

}

export default new FileService();
