//Http Status Code
import { StatusCodes } from "http-status-codes";
//Dto
import { bodyToStore } from '#Dto/store.dto.js';
//Service
import { createStore } from '#Service/store.service.js';
import { saveFile } from '#Service/file.service.js';

//가게 추가
export const handleStoreAdd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeData = bodyToStore(req.body, req.files);

    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      const savePromises = req.files.map(file => saveFile('stores', file));
      const urls = await Promise.all(savePromises);
      photoUrls.push(...urls);
    }

    const finalStoreData = { ...storeData, photoUrls };
    const newStore = await createStore(userId, finalStoreData);

    res.status(StatusCodes.CREATED).success({"storeId": Number(newStore.id)})
  } catch (err) {
    next(err);
  }
};