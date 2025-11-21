import CustomError from '#Middleware/error/customError.js';
import { isStoreExist } from '#Repository/store.repository.js';
import { getOwnerIdFromStoreId } from '#Repository/store.repository.js';

//가게 존재여부 확인
export const checkStoreExists = async (req, res, next) => {
    try {
        const storeId = req.params.storeId;
        const exists = await isStoreExist(storeId);
        if (!exists) {
            throw new CustomError({ name: 'STORE_NOT_FOUND' });
        }
        next();
    } catch (err) {
        next(err);
    }
};

//가게 주인 확인
export const checkStoreOwnership = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const storeId = req.params.storeId;
        
        const ownerId = await getOwnerIdFromStoreId(storeId);

        if (loggedInUserId !== ownerId) {
            throw new CustomError({ name: 'FORBIDDEN' });
        }
        next();
    } catch (err) {
        next(err);
    }
};