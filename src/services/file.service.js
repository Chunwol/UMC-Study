import path from 'path';
import fs from 'fs';
import util from 'util';
import CustomError from '#Middleware/error/customError.js';

//파일 저장
const writeFilePromise = util.promisify(fs.writeFile);
export const saveFile = async (domain, file) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const uploadDir = path.join('uploads', domain, String(year), month, day);
        fs.mkdirSync(uploadDir, { recursive: true });

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${domain}-${uniqueSuffix}${path.extname(file.originalname)}`;
        
        const filepath = path.join(uploadDir, filename);
        const fileUrl = `/${filepath.replace(/\\/g, "/")}`;

        await writeFilePromise(filepath, file.buffer);

        return fileUrl;

    } catch (err) {
        console.error('File save error:', err);
        throw new CustomError({ name: 'FILE_SAVE_ERROR' });
    }
};