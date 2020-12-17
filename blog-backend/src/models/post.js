import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    _id: mongoose.Types.ObjectId, // mongoDB의 고유 id
    username: String,
  },
});

const Post = mongoose.model('Post', PostSchema); // 인스턴스를 만들고 난 후에 사용할 수 있음
export default Post;
