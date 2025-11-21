import { addUser, getUserIdPwFromEmail } from "#Repository/user.repository.js";
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

//로그인
export const userLogin = async (data) => {
  const user = await getUserIdPwFromEmail(data.email);
  const isPasswordValid = user ? await bcrypt.compare(
    data.password,
    user.password
  ) : false;
  if (!user || !isPasswordValid) {
    throw new CustomError({ name: 'LOGIN_FAILED' });
  }

  return user.id;
}