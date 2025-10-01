import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import error_handler from './errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class file_upload 
{
    static create_upload_dir(dir) 
    {
        if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    static avatar_storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const upload_dir = path.join(__dirname, '../public/uploads/avatars');
            file_upload.create_upload_dir(upload_dir);
            cb(null, upload_dir);
        },
        filename: (req, file, cb) => {
            const user_id = req.user?.id || 'temp';
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            cb(null, `avatar_${user_id}_${timestamp}${ext}`);
        }
    });

    static post_image_storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const upload_dir = path.join(__dirname, '../public/uploads/posts');
            file_upload.create_upload_dir(upload_dir);
            cb(null, upload_dir);
        },
        filename: (req, file, cb) => {
            const user_id = req.user?.id || 'temp';
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            cb(null, `post_${user_id}_${timestamp}${ext}`);
        }
    });

    static image_filter = (req, file, cb) => {
        const allowed_types = /jpeg|jpg|png|gif|webp/;
        const extname = allowed_types.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowed_types.test(file.mimetype);

        if(mimetype && extname) 
            {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    };

    static upload_avatar = multer({
        storage: file_upload.avatar_storage,
        limits: 
        {
            fileSize: 2 * 1024 * 1024, // 2MB limit
        },
        fileFilter: file_upload.image_filter
    }).single('avatar');

    static upload_post_images = multer({
        storage: file_upload.post_image_storage,
        limits: 
        {
            fileSize: 5 * 1024 * 1024, // 5MB limit per file
            files: 5 // Maximum 5 files
        },
        fileFilter: file_upload.image_filter
    }).array('images', 5);

    //error handling wrapper
    static handle_upload_error(upload_func) 
    {
        return (req, res, next) => {
            upload_func(req, res, (error) => {
                if(error instanceof multer.MulterError) 
                    {
                    if(error.code === 'LIMIT_FILE_SIZE') return next(new Error('File too large'));
                    
                    if(error.code === 'LIMIT_FILE_COUNT') return next(new Error('Too many files'));
                    
                    if (error.code === 'LIMIT_UNEXPECTED_FILE') return next(new Error('Unexpected file field'));

                    return next(new Error('File upload error'));
                }
                if(error) return next(error);

                next();
            });
        };
    }

    static delete_file(file_path) 
    {
        try 
        {
            if(fs.existsSync(file_path)) fs.unlinkSync(file_path);
        } catch(error) 
        {
            console.error('Error deleting file:', error);
        }
    }

    static get_file_url(req, filename, type = 'avatars') 
    {
        const base_url = `${req.protocol}://${req.get('host')}`;

        return `${base_url}/uploads/${type}/${filename}`;
    }
}

export default file_upload;
