import { Prisma } from '@prisma/client';
import { prisma } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';

//미션 생성
export const addMission = async (data) => {
    try {
        const newMission = await prisma.mission.create({
            data: {
                storeId: data.store_id,
                type: data.type,
                reward: data.reward,
                description: data.description,
                deadline: data.deadline
            }
        });
        return newMission;

    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//미션 존재여부 확인
export const isMissionExist = async (missionId) => {
    try {
        const count = await prisma.mission.count({
            where: {
                id: missionId,
            },
        });
        return count > 0;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//미션 도전여부 확인
export const isMissionChallenging = async (userId, missionId) => {
    try {
        const count = await prisma.userMission.count({
            where: {
                userId: userId,
                missionId: missionId,
            },
        });
        return count > 0;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//미션 도전하기
export const addUserMission = async (userId, missionId) => {
    try {
        const newUserMission = await prisma.userMission.create({
            data: {
                userId: userId,
                missionId: missionId,
                status: false
            }
        });
        return newUserMission;

    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                 throw new CustomError({ name: 'MISSION_ALREADY_CHALLENGING' });
            }
        }
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};