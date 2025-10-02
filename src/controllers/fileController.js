import FileService from '../services/file.service.js'


class FileController {
  static async generatePresignedUrl(req, res) {
    const { fileName, fileType, fileSize, folderName } = req.query;
    const createdBy = req.user._id; 
    try {
      if (!fileName || !fileType || !fileSize) {
        return res
          .status(400)
          .json({ message: 'File name and type are required' });
      }
      const { filePath, uploadUrl } = await FileService.getPreSignUploadUrl(fileName, fileType, folderName);
      const savedFileInfo = await FileService.saveFileInfo(createdBy, fileName, fileType, fileSize, filePath);

      res.status(200).json({ fileId: savedFileInfo._id, uploadUrl, filePath });
    } catch (error) {
      console.log('Error generating presigned URL:', error);
      res.status(500).json({ message: 'Error generating presigned URL' });
    }
  }

  static async getFile(req, res) {
    const { fileId } = req.params;

    try {
      const fileData = await FileService.getFile(fileId);
      res.json(fileData);
    } catch (error) {
      console.log('Error fetching file:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getFilesByIds(req, res) {
    const { fileIds } = req.body;
    if (!fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({
        message: 'fileIds query parameter is required and should be an array',
      });
    }

    try {
      const filesData = await FileService.getFilesByIds(fileIds);
      res.json(filesData);
    } catch (error) {
      console.log('Error fetching files:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteFile(req, res) {
    const { fileId } = req.params;

    try {
      await FileService.deleteFile(fileId);
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.log('Error deleting file:', error);
      res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export default FileController;
