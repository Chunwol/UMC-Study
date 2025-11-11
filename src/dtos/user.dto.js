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

// export const responseFromUser = ({ user, favoriteFood }) => {
//   if (!user) {
//     return null;
//   }
//   const favoriteFoodIds = favoriteFood.map(pref => pref.id);

//   return {
//     id: user.id,
//     email: user.email,
//     name: user.name,
//     gender: user.gender,
//     birthday: user.birthday,
//     addressCode: user.addressCode,
//     addressDetail: user.addressDetail,
//     phoneNumber: user.phoneNumber,
//     favoriteFoodIds: preferenceNames,
//   };
// };