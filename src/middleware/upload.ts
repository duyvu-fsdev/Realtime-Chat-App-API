import multer from "multer";

const importFile = multer({ storage: multer.memoryStorage() });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, "uploads/videos/");
    else if (file.mimetype.startsWith("image/")) cb(null, "uploads/images/");
    else cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const sendAttachedFiles = multer({ storage: diskStorage });

export default { importFile, sendAttachedFiles };
