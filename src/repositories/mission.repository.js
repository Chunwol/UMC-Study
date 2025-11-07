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

//가게별 미션 목록 조회
export const getMissionsByStoreId = async (userId, storeId, cursor, limit, sortBy) => {
    try {
        const now = new Date();

        let whereConditions = {
            storeId: storeId,
            deadline: { gt: now }
        };

        let orderByConditions;

        if (sortBy === 'amount') {
            orderByConditions = [
                { reward: 'desc' },
                { deadline: 'asc' }
            ];

            if (cursor) {
                const [lastReward, lastDeadlineStr] = cursor.split('_');
                const lastRewardNum = Number(lastReward);
                const lastDeadline = new Date(lastDeadlineStr);

                whereConditions.OR = [
                    {
                        reward: { lt: lastRewardNum }
                    },
                    {
                        reward: lastRewardNum,
                        deadline: { gt: lastDeadline }
                    }
                ];
            }

        } else {
            orderByConditions = [
                { deadline: 'asc' },
                { id: 'desc' }
            ];

            if (cursor) {
                const [lastDeadlineStr, lastId] = cursor.split('_');
                const lastDeadline = new Date(lastDeadlineStr);
                const lastIdNum = Number(lastId);

                whereConditions.OR = [
                    {
                        deadline: { gt: lastDeadline }
                    },
                    {
                        deadline: lastDeadline,
                        id: { lt: lastIdNum }
                    }
                ];
            }
        }

        const missions = await prisma.mission.findMany({
            where: whereConditions,
            orderBy: orderByConditions,
            take: limit,
            include: {
                userMissions: {
                    where: {
                        userId: userId 
                    },
                    select: {
                        id: true 
                    }
                }
            }
        });

        return missions;

    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//유저별 미션 목록 조회
export const getMissionsByUserIdAndStatus = async (userId, status, cursor, limit) => {
    try {
        const now = new Date();

        let whereConditions = {
            userId: userId,
            status: status
        };

        if (cursor) {
            whereConditions.id = { lt: Number(cursor) };
        }

        if (status === false) {
            whereConditions.mission = {
                deadline: {
                    gt: now
                }
            };
        }

        const userMissions = await prisma.userMission.findMany({
            where: whereConditions,
            include: {
                mission: {
                    include: {
                        store: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: {
                id: 'desc'
            },
            take: limit
        });
        
        return userMissions;

    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//유저의 미션 도전 상태 조회
export const getUserMissionStatus = async (userId, missionId) => {
    try {
        const userMission = await prisma.userMission.findUnique({
            where: {
                userId_missionId: { 
                    userId: userId,
                    missionId: missionId
                }
            },
            select: { status: true }
        });
        return userMission;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//유저 미션 완료 처리 및 포인트 지급
export const completeUserMissionAndGrantPoints = async (userId, missionId) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const mission = await tx.mission.findUnique({
                where: { id: missionId },
                select: { reward: true }
            });

            if (!mission) {
                throw new CustomError({ name: 'MISSION_NOT_FOUND' });
            }
            
            const rewardAmount = mission.reward || 0;

            const updatedUserMission = await tx.userMission.update({
                where: {
                    userId_missionId: {
                        userId: userId,
                        missionId: missionId
                    },
                    status: false
                },
                data: {
                    status: true
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    point: { increment: rewardAmount }
                }
            });

            return { updatedUserMission, rewardAmount };
        });

        return result;

    } catch (err) {
        if (err instanceof CustomError) {
            throw err;
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new CustomError({ name: 'MISSION_NOT_IN_PROGRESS', message: '해당 미션은 진행 중 상태가 아니거나 이미 완료되었습니다.' });
        }
        
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR', message: '미션 완료 처리 중 오류 발생' });
    }
};