import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import error_handler from '../middleware/errorHandler.js';

class file_processing_service 
{
    static allowed_image_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    static allowed_document_types = ['application/pdf', 'text/plain', 'application/json'];
    static max_file_size = 10 * 1024 * 1024; // 10MB

    static async process_image(inputPath, options = {}) 
    {
        try 
        {
            const {
                width = 800,
                height = 600,
                quality = 80,
                format = 'jpeg',
                addWatermark = false,
                watermarkText = 'USOF'
            } = options;

            const output_dir = path.dirname(inputPath);
            const filename = path.basename(inputPath, path.extname(inputPath));
            const output_path = path.join(output_dir, `${filename}_processed.${format}`);

            let pipeline = sharp(inputPath)
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });

            if(addWatermark) 
                {
                const watermark_buff = Buffer.from(
                    `<svg width="200" height="50">
                        <text x="10" y="25" font-family="Arial" font-size="16" fill="rgba(255,255,255,0.5)">${watermarkText}</text>
                    </svg>`
                );
                
                pipeline = pipeline.composite([{
                    input: watermark_buff,
                    gravity: 'southeast'
                }]);
            }

            switch(format) 
            {
                case 'jpeg':
                case 'jpg': pipeline = pipeline.jpeg({ quality }); break;
                case 'png': pipeline = pipeline.png({ quality }); break;
                case 'webp': pipeline = pipeline.webp({ quality }); break;
            }

            await pipeline.toFile(output_path);

            const metadata = await sharp(output_path).metadata();
            const stats = await fs.stat(output_path);

            return {
                success: true,
                originalPath: inputPath,
                processedPath: output_path,
                metadata: 
                {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                    size: stats.size
                }
            };
        } 
        catch(error) 
        {
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    static async generate_thumbnails(inputPath, sizes = [150, 300, 600]) 
    {
        try 
        {
            const thumbnails = [];
            const output_dir = path.dirname(inputPath);
            const filename = path.basename(inputPath, path.extname(inputPath));

            for(const size of sizes) 
                {
                const thumbnail_path = path.join(output_dir, `${filename}_thumb_${size}.jpg`);
                
                await sharp(inputPath)
                    .resize(size, size, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 80 })
                    .toFile(thumbnail_path);

                const stats = await fs.stat(thumbnail_path);
                
                thumbnails.push({
                    size: size,
                    path: thumbnail_path,
                    fileSize: stats.size
                });
            }

            return {
                success: true,
                thumbnails: thumbnails
            };
        } 
        catch(error) 
        {
            throw new Error(`Thumbnail generation failed: ${error.message}`);
        }
    }

    static validate_file(file) 
    {
        const errors = [];
        
        if(file.size > this.max_file_size) 
            {
            errors.push(`File size exceeds limit of ${this.max_file_size / (1024 * 1024)}MB`);
        }

        const allowed_types = [...this.allowed_image_types, ...this.allowed_document_types];
        if(!allowed_types.includes(file.mimetype)) 
            {
            errors.push(`File type ${file.mimetype} is not allowed`);
        }

        const ext = path.extname(file.originalname).toLowerCase();
        const allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.txt', '.json'];
        if(!allowed_extensions.includes(ext)) 
            {
            errors.push(`File extension ${ext} is not allowed`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static generate_unique_filename(originalName) 
    {
        const timestamp = Date.now();
        const random_str = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(originalName);
        const base_name = path.basename(originalName, ext);
        
        return `${base_name}_${timestamp}_${random_str}${ext}`;
    }

    static async get_file_metadata(filePath) 
    {
        try 
        {
            const stats = await fs.stat(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            let metadata = {
                filename: path.basename(filePath),
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                extension: ext
            };

            if(this.allowed_image_types.some(type => type.includes(ext.substring(1)))) {
                try 
                {
                    const image_metadata = await sharp(filePath).metadata();
                    metadata.image = {
                        width: image_metadata.width,
                        height: image_metadata.height,
                        format: image_metadata.format,
                        channels: image_metadata.channels,
                        hasAlpha: image_metadata.hasAlpha
                    };
                } catch(err) 
                {
                    console.warn('Could not extract image metadata:', err.message);
                }
            }

            return metadata;
        } 
        catch(error) 
        {
            throw new Error(`Failed to get file metadata: ${error.message}`);
        }
    }

    static async create_backup(filePath) 
    {
        try 
        {
            const backup_dir = path.join(path.dirname(filePath), 'backups');
            await fs.mkdir(backup_dir, { recursive: true });
            
            const filename = path.basename(filePath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backup_path = path.join(backup_dir, `${timestamp}_${filename}`);
            
            await fs.copyFile(filePath, backup_path);
            
            return {
                success: true,
                backupPath: backup_path
            };
        } 
        catch(error) 
        {
            throw new Error(`Backup creation failed: ${error.message}`);
        }
    }

    static async cleanup_old_files(directory, maxAge = 30) 
    {
        try 
        {
            const files = await fs.readdir(directory);
            const now = Date.now();
            const max_age_ms = maxAge * 24 * 60 * 60 * 1000;
            
            let deleted_count = 0;
            let deleted_size = 0;

            for(const file of files) 
                {
                const filepath = path.join(directory, file);
                const stats = await fs.stat(filepath);
                
                if(now - stats.mtime.getTime() > max_age_ms) 
                    {
                    deleted_size += stats.size;
                    await fs.unlink(filepath);
                    deleted_count++;
                }
            }

            return {
                success: true,
                deletedCount: deleted_count,
                freedSpace: deleted_size
            };
        } 
        catch(error) 
        {
            throw new Error(`Cleanup failed: ${error.message}`);
        }
    }
}

export default file_processing_service;
