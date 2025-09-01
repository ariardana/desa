import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'documents') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'gallery') {
      uploadPath += 'gallery/';
    } else if (file.fieldname === 'complaints') {
      uploadPath += 'complaints/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Document files
  if (file.fieldname === 'documents') {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid document type. Only PDF, DOC, XLS, PPT files allowed.'));
    }
  }
  
  // Image files
  if (file.fieldname === 'gallery' || file.fieldname === 'complaints') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, GIF, WebP files allowed.'));
    }
  }
  
  cb(new Error('Invalid field name'));
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Max 5 files per request
  },
});