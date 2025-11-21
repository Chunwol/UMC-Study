export const bodyToReview = (body, files) => {
    return {
        star_rating: parseFloat(body.star_rating),
        content: body.content?.trim() || '',
        files: files || []
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

export const responseForMyReviews = ({ reviews, nextCursor, limit }) => {
    const formattedReviews = reviews.map(review => ({
        reviewId: Number(review.id),
        storeName: review.store.name,
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