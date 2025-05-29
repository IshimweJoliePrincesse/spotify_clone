import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the upload directory based on file type
    let uploadPath = path.join(__dirname, "../../uploads");

    if (file.mimetype.startsWith("audio/")) {
      uploadPath = path.join(uploadPath, "songs");
    } else if (file.mimetype.startsWith("image/")) {
      uploadPath = path.join(uploadPath, "images");
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept audio and image files
  if (
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only audio and image files are allowed."),
      false
    );
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
