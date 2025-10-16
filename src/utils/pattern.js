//패턴
export const email = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
export const password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const refreshToken = /^[a-f0-9]{80}$/;