import { prisma } from "../db.config.js";
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import CustomError from '#Middleware/error/customError.js';

//유저 추가
export const addUser = async (data) => {
  try {

    const newUser = await prisma.$transaction(async (tx) => {
      
      const existingUser = await tx.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new CustomError({ name: 'EMAIL_ALREADY_EXISTS' });
      }

      const regionId = await getRegionIdFromCode(data.addressCode, tx);
      if (!regionId) {
        throw new CustomError({ name: 'BAD_REQUEST', message: '제공된 주소에 해당하는 지역 정보를 찾을 수 없습니다.' });
      }

      const createdUser = await tx.user.create({
        data: {
          email: data.email,
          password: data.hashedPassword,
          name: data.name,
          gender: data.gender,
          birthday: data.birthday,
          regionId: regionId,
          addressDetail: data.addressDetail,
          refreshToken: null
        }
      });

      const defaultNickname = `user_${createdUser.id}`;
      await tx.profile.create({
        data: {
          userId: createdUser.id,
          nickname: defaultNickname,
          imageUrl: null
        }
      });

      if (data.terms && data.terms.length > 0) {
        const termsData = data.terms.map(term => ({
          userId: createdUser.id,
          termId: term.termId,
          isAgreed: term.isAgreed
        }));

        await tx.userTerm.createMany({
          data: termsData
        });
      }

      if (data.favoriteFoodIds && data.favoriteFoodIds.length > 0) {
        const favoriteFoodData = data.favoriteFoodIds.map(foodId => ({
          userId: createdUser.id,
          foodId: foodId
        }));

        await tx.userFavorite.createMany({
          data: favoriteFoodData
        });
      }

      return createdUser;
    });

    return newUser.id;

  } catch (err) {
    if (err instanceof CustomError) {
        throw err;
    }
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//유저ID로 유저검색
export const getUserFromId = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    return user; 
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//email로 UserID와PW을 검색
export const getUserIdPwFromEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        password: true
      }
    });
    return user;
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//RefreshToken으로 유저ID검색
export const getUserIdFromToken = async (token) => {
  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken: token },
      select: { id: true }
    });
    return user ? user.id : null;
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//유저ID로 프로필ID검색
export const getProfileIdFromUserId = async (userId) => {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
        select: { id: true }
      });
      return profile ? profile.id : null;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
}

// //좋아하는 음식 설정(미사용)
// export const setfavoriteFood = async (userId, foodId) => {
//   try {
//     await prisma.userFavorite.create({
//       data: {
//         userId: userId,
//         foodId: foodId
//       }
//     });
//     return;
//   } catch (err) {
//     console.error(err);
//     throw new CustomError({ name: 'DATABASE_ERROR' });
//   }
// };

//RefreshToken 업데이트
export const updateRefreshToken = async (userId, refreshToken) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshToken }
    });
    return !!updatedUser;
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};