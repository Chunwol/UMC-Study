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
        "status": "success",
        "data": {
            "reviews": formattedReviews,
            "cursor": {
                "nextCursor": nextCursor,
                "pageSize": limit,
                "hasNextPage": hasNextPage
            }
        }
    };
};