// src/storage/interface/interceptors/file-upload.interceptor.ts
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const storageEngine = multer.memoryStorage();

const multerOptions: MulterOptions = {
  storage: storageEngine,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,
  },
};

/**
 * Interceptor standar untuk semua upload file di module ini.
 */
export const FileUploadInterceptor = FileInterceptor('file', multerOptions);
