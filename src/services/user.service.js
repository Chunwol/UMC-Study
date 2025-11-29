import { prisma } from "../db.config.js"; 
import { addUser, updateUserInfo, getUserIdPwFromEmail } from "#Repository/user.repository.js";
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import CustomError from "#Middleware/error/customError.js";
import bcrypt from "bcrypt";

//회원가입
export const userSignUp = async (data) => {
  
  const hashedPassword = await bcrypt.hash(data.password, 10);

const joinUserId = await addUser({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    gender: data.gender,
    birthday: data.birthday,
    addressCode: data.addressCode,
    addressDetail: data.addressDetail,
    terms: data.terms,
    favoriteFoodIds: data.favoriteFoodIds
  });

  if (!joinUserId) {
    throw new CustomError({ name: 'EMAIL_ALREADY_EXISTS' });
  }

  return joinUserId;
};

// 소셜 유저 정보 업데이트
export const updateSocialUserInfo = async (userId, data) => {
    let regionId = null;
    if (data.addressCode) {
        regionId = await getRegionIdFromCode(data.addressCode);
        if (!regionId) {
            throw new CustomError({ name: 'BAD_REQUEST', message: '유효하지 않은 지역 코드입니다.' });
        }
    }

 const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.gender) updateData.gender = data.gender;
    if (data.birthday) updateData.birthday = data.birthday; 
    if (data.addressDetail) updateData.addressDetail = data.addressDetail;
    if (data.phoneNumber) updateData.cellPhone = data.phoneNumber;
    if (regionId) updateData.regionId = regionId;

    updateData.isVerified = true;

    const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: BigInt(userId) },
            data: updateData
        });

        if (data.favoriteFoodIds && data.favoriteFoodIds.length > 0) {
            const favoriteFoodData = data.favoriteFoodIds.map(foodId => ({
                userId: BigInt(userId),
                foodId: foodId
            }));
            
            await tx.userFavorite.createMany({
                data: favoriteFoodData,
                skipDuplicates: true 
            });
        }

        if (data.terms && data.terms.length > 0) {
            const termsData = data.terms.map(term => ({
                userId: BigInt(userId),
                termId: term.termId,
                isAgreed: term.isAgreed
            }));

            await tx.userTerm.createMany({
                data: termsData,
                skipDuplicates: true
            });
        }

        return user;
    });

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isVerified: updatedUser.isVerified
    };
};