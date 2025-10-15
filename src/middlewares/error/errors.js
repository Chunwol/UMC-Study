const Errors = {
  // 400: Bad Request (잘못된 요청)
  BAD_REQUEST: {
    code: 400,
    message: '잘못된 요청입니다. 입력값을 확인해주세요.',
    description: '필수 파라미터 누락 또는 데이터 형식 오류',
  },

  // 401: Unauthorized (인증 실패)
  LOGIN_FAILED: {
    code: 401,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    description: '로그인 실패: 일치하는 사용자 없음 또는 비밀번호 오류',
  },
  UNAUTHORIZED: {
    code: 401,
    message: '로그인이 필요합니다.',
    description: '인증 실패: 유효한 토큰이 제공되지 않음',
  },
  TOKEN_EXPIRED: {
    code: 401,
    message: '세션이 만료되었습니다. 다시 로그인해주세요.',
    description: '인증 실패: 토큰 만료',
  },
  INVALID_TOKEN: {
    code: 401,
    message: '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
    description: '인증 실패: 토큰의 형식이 잘못되었거나 서명이 유효하지 않음',
  },

  // 403: Forbidden (권한 없음)
  FORBIDDEN: {
    code: 403,
    message: '요청에 대한 권한이 없습니다.',
    description: '권한 거부: 해당 리소스에 접근/수정할 권한 없음',
  },

  // 404: Not Found (리소스를 찾을 수 없음)
    NOT_FOUND: {
    code: 404,
    message: '요청하신 경로를 찾을 수 없습니다.',
    description: 'API 경로 없음: 요청한 URL에 해당하는 API가 서버에 존재하지 않음',
  },
  USER_NOT_FOUND: {
    code: 404,
    message: '사용자를 찾을 수 없습니다.',
    description: '리소스 없음: 요청한 ID의 사용자가 존재하지 않음',
  },
  STORE_NOT_FOUND: {
    code: 404,
    message: '가게를 찾을 수 없습니다.',
    description: '리소스 없음: 요청한 ID의 가게가 존재하지 않음',
  },
  MISSION_NOT_FOUND: {
    code: 404,
    message: '미션을 찾을 수 없습니다.',
    description: '리소스 없음: 요청한 ID의 미션이 존재하지 않음',
  },
  REVIEW_NOT_FOUND: {
    code: 404,
    message: '리뷰를 찾을 수 없습니다.',
    description: '리소스 없음: 요청한 ID의 리뷰가 존재하지 않음',
  },

  // 409: Conflict (충돌)
  EMAIL_ALREADY_EXISTS: {
    code: 409,
    message: '이미 사용 중인 이메일입니다.',
    description: '회원가입 실패: 이메일 중복',
  },
  NICKNAME_ALREADY_EXISTS: {
    code: 409,
    message: '이미 사용 중인 닉네임입니다.',
    description: '프로필 생성/수정 실패: 닉네임 중복',
  },

  // 500: Internal Server Error (서버 내부 오류)
  DATABASE_ERROR: {
    code: 500,
    message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    description: '데이터베이스 오류: 쿼리 실행 중 예외 발생',
  },
  UNHANDLED_ERROR: {
    code: 500,
    message: '알 수 없는 오류가 발생했습니다. 관리자에게 문의해주세요.',
    description: '처리되지 않은 예외 발생',
  },
};

export default Errors;