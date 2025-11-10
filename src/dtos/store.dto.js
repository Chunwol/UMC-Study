export const bodyToStore = (body, files) => {
  const storeHours = body.storeHours ? JSON.parse(body.storeHours) : [];

  return {
    name: body.name.trim(),
    addressDetail: body.addressDetail?.trim(),
    addressCode: body.addressCode,
    industry: body.industry?.trim(),
    storeHours,
    files: files || [] 
  };
};

export const bodyToReview = (body, files) => {
    return {
        star_rating: parseFloat(body.star_rating),
        content: body.content?.trim() || '',
        files: files || []
    };
};

export const bodyToMission = (body) => {
    return {
        reward: parseInt(body.reward),
        description: body.description.trim(),
        deadline: new Date(body.deadline)
    };
};

export const responseForReviews = ({ reviews, nextCursor, limit }) => {
    const formattedReviews = reviews.map(review => ({
        reviewId: Number(review.id),
        authorNickname: review.profile.nickname,
        starRating: review.starRating,
        content: review.content,
        createdAt: review.createdAt,
        photos: review.photos.map(photo => photo.link)
    }));

    const hasNextPage = nextCursor !== null; 
    
    return {
        "reviews": formattedReviews,
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