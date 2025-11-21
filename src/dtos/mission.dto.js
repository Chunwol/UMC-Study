export const bodyToMission = (body) => {
    return {
        reward: parseInt(body.reward),
        description: body.description.trim(),
        deadline: new Date(body.deadline)
    };
};

export const responseForMyMissions = ({ userMissions, nextCursor, limit }) => {
    const formattedMissions = userMissions.map(userMission => ({
        userMissionId: Number(userMission.id),
        status: userMission.status ? 'completed' : 'in-progress',
        missionDetails: {
            missionId: Number(userMission.mission.id),
            storeId: Number(userMission.mission.store.id),
            reward: userMission.mission.reward,
            description: userMission.mission.description,
            deadline: userMission.mission.deadline,
            storeName: userMission.mission.store.name
        },
        challengedAt: userMission.createdAt
    }));

    const hasNextPage = nextCursor !== null; 
    
    return {
        "missions": formattedMissions,
        "cursor": {
            "nextCursor": nextCursor,
            "pageSize": limit,
            "hasNextPage": hasNextPage
        }
    };
};

export const responseForMissions = ({ missions, nextCursor, limit }) => {
    const formattedMissions = missions.map(mission => ({
        missionId: Number(mission.id),
        storeId: Number(mission.storeId),
        reward: mission.reward,
        description: mission.description,
        deadline: mission.deadline,
        createdAt: mission.createdAt,
        isChallenging: mission.userMissions && mission.userMissions.length > 0
    }));

    const hasNextPage = nextCursor !== null; 
    
    return {
        "missions": formattedMissions,
        "cursor": {
            "nextCursor": nextCursor,
            "pageSize": limit,
            "hasNextPage": hasNextPage
        }
    };
};

export const responseForMissionComplete = ({ updatedUserMission, rewardAmount }) => {
    return {
        "userMissionId": Number(updatedUserMission.id),
        "userId": Number(updatedUserMission.userId),
        "missionId": Number(updatedUserMission.missionId),
        "status": "completed",
        "rewardGranted": rewardAmount,
        "completedAt": updatedUserMission.updatedAt
    };
};