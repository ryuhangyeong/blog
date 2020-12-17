import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스화 후 사용할 수 있는 일종의 메서드를 methods로 만든다.
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10); // 해쉬화
  this.hashedPassword = hash; // this는 User를 의미
};

// 올바른 비밀번호인가를 확인
UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword); // 입력받은 비밀번호와 유저 번호 비교하여 boolean 타입 반환
  return result;
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON(); // User 정보를 JSON 객체로 만든다
  delete data.hashedPassword; // hashedPassword 키 삭제
  return data;
};

// JWT 토큰
UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username, // JWT에 저장할 정보, 유출되면 안되는 데이터는 포함해서는 안된다.
    },
    process.env.JWT_SECRET, // JWT SECRET KEY
    {
      expiresIn: '7d', // 7일 동안 유효기간
    },
  );

  return token; // 일종의 문자열 (JWT)
};

// statics에서 this는 데이터베이스의 스키마 자체인듯하다
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);

export default User;
