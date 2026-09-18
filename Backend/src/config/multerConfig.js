import multerS3 from "multer-s3";
import multer from "multer";
import { randomUUID } from "crypto";
import { s3 } from "./r2Config.js";
import { R2_BUCKET_NAME } from "./serverConfig.js";

const EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
};

const fileFilter = (req, file, cb) => {
    if(!EXTENSIONS[file.mimetype]){
        return cb(new Error("Invalid file type, only JPEG, PNG, WebP, and PDF are allowed"), false);
    }

    cb(null, true);
}

export const s3Uploader = multer({
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB
    },
    storage: multerS3({
        s3: s3,
        bucket: R2_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (_, file, cb){
            if(!file){
                return cb(new Error("No file provided"), null);
            }

            const extension = EXTENSIONS[file.mimetype];
            const fileName = `${file.fieldname}/${randomUUID()}.${extension}`;
            cb(null, fileName);
        }
    })
})