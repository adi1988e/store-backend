const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    cb(null,`${Date.now()}-${file.originalname}`)
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  }
  cb(null, false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 4,
  },
  fileFilter,
});

module.exports = upload;
