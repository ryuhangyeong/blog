import jwt from 'jsonwebtoken';
import User from '../models/user';

/*
  미들웨어
 */
const jwtMiddleware = (ctx, next) => {
  const token = ctx.cookies.get('access_token'); // 입력받은 http 객체의 쿠키에서 access_token을 가져온다.
  if (!token) return next(); // token 없으면 다음 미들웨어나 라우터로 통과
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰과 서버에 있는 JWT_SECRET를 활용

    // 서버내 상태로 저장
    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };
    /*
      {
        iat: 1607423405, // 이 토큰이 언제 만들어졌는지
        exp: 1608028205 // 언제 만료되는지
      }
     */
    /*
      exp에 표현된 날짜가 3.5일 미만이라면 토큰을 새로운 토큰으로 재발급
      2020년 12월 17일 6시 24분에 토큰 만듬(exp), 쿠키도 일주일로 설정(지금으로부터 일주일 뒤)
      만약에 17일 + 7일 이후에 요청 한다면 마이너스니까 조건 충족 / 3.5 미만 일때도 조건 충족
    */
    const now = Math.floor(Date.now() / 1000); // 현재 날짜
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      // 60 * 60 * 24 * 3.5는 3.5일에 대한 초 정보
      const user = User.findById(decoded._id); // 유저 정보 조회
      const token = user.generateToken(); // 유저 정보를 기반으로 JWT TOKEN 다시 만들기
      ctx.cookies.set('access_token', token, {
        // 쿠키에 다시 담기
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true, // 브라우저에서 COOKIE 수정 못하게
      });
    }
    return next(); // 다음 미들 웨어로
  } catch (e) {
    return next(); // 오류가 있더라도 다음 미들 웨어로
  }
};

export default jwtMiddleware;
