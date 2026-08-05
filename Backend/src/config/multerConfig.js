import multerS3 from "multer-s3";
import { AWS_BUCKET_NAME } from "./serverConfig.js";
import { s3 } from "./awsConfig.js";
import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];

const fileFilter = (req, file, cb) => {
    if(!ALLOWED_MIME_TYPES.includes(file.mimetype)){
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
        bucket: AWS_BUCKET_NAME,
        key: function (_, file, cb){
            if(!file){
                return cb(new Error("No file provided"), null);
            }

            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
            const extension = file.mimetype.split("/")[1];
            const fileName = file.fieldname + "-" + uniqueSuffix + "." + extension;
            cb(null, fileName);
        }
    })
})