export const bodyToUser = (body) => {
  const birthday = new Date(body.birthday);

  return {
    email: body.email.trim(), //필수 
    password: body.password, //필수 
    name: body.name.trim(), // 필수
    gender: body.gender.toUpperCase(), // 필수
    birthday, // 필수
    addressCode: body.addressCode, //필수
    addressDetail: body.addressDetail || "", //선택 

    favoriteFoodIds: body.favoriteFoodIds || [], //선택
    terms: body.terms //필수
  };
};

export const bodyToLogin = (body) => {
  return {
    email: body.email, //필수 
    password: body.password, //필수 
  };
};

export const bodyToToken = (body) => {
  return body.refreshToken; //필수 
};

export const bodyToUserInfoUpdate = (body) => {
    return {
        name: body.name,
        gender: body.gender,
        birthday: body.birthday ? new Date(body.birthday) : undefined,
        addressCode: body.addressCode,
        addressDetail: body.addressDetail,
        phoneNumber: body.phoneNumber,
        favoriteFoodIds: body.favoriteFoodIds,
        terms: body.terms
    };
};

export const responseFromUserInfoUpdate = (user) => {
    return {
        userId: Number(user.id),
        email: user.email,
        name: user.name,
        isVerified: user.isVerified
    };
};

export const responseFromSocialLogin = (tokens, user) => {
    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        needsAdditionalInfo: !user.isVerified
    };
};