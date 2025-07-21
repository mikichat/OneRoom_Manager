const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024 }, // Default to 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|xlsx|xls/;
    const mimetypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/haansoftxls'
    ];

    const mimetypeCheck = mimetypes.includes(file.mimetype);
    const extnameCheck = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetypeCheck && extnameCheck) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Invalid file type. Only images, PDFs, and Excel files are allowed.'));
    }
  }
});

module.exports = upload;
