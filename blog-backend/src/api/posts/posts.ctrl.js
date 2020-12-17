import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';
import sanitizeHtml from 'sanitize-html'; // scripting 공격을 막기 위한 용도

const { ObjectId } = mongoose.Types; // Mongodb ObjectId 검증 용도

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

/*
  const post = new Router();

  post.get('/', postsCtrl.read);
  post.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
  post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);

  posts.use('/:id', postsCtrl.getPostById, post.routes());
  와 관련 있음

  해당 코드는 매우 우아하다.
*/
export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    // 받은 id가 몽고db의 id가 맞는지 확인
    ctx.status = 400;
    return;
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }

  return next();
};

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state; // 서버내 메모리에서 user, post 가져온다.
  if (post.user._id.toString() !== user._id) {
    // 로그인한 사용자와 주인 검증
    ctx.status = 403;
    return;
  }
  return next();
};

export const write = async (ctx) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const result = schema.validate(ctx.request.body);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: ctx.state.user,
  });

  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

const removeHtmlAndShorten = (body) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`;
};
/*
  페이지 기능 구현
  skip은 넘긴다는 의미로 skip 함수에 파라미터로 10을 넣어주면, 처음 열개를 제외하고 그 다음 데이터를 불러옵니다.
  20개라면, 처음 20개를 제외하고 그다음 데이터 열개를 불러옵니다.
  skip = (page - 1) * 10, page가 없다면 1로 간주합니다.  
 */
export const list = async (ctx) => {
  // 이부분이 복잡
  try {
    const page = parseInt(ctx.query.page || '1', 10); // page query가 없으면 기본값 1 /?page=1
    if (page < 1) {
      ctx.status = 400;
      return;
    }

    const { tag, username } = ctx.query; // tag와 username은 options
    // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query = {
      // 스프레드 연산자로 객체를 합친다.
      ...(username ? { 'user.username': username } : {}), // user가 있으면 user 전달 없으면 빈 객체
      ...(tag ? { tags: tag } : {}), // tag도 마찬가지
    };

    /*
      query = {
        'user.username': '', // opts
        'tags': [] // opts
      }
    */
    const posts = await Post.find(query)
      .sort({ _id: -1 }) // 데이터 역순
      .limit(10) // 10개 제한
      .skip((page - 1) * 10) // 페이징 처리
      .exec(); // 실행
    const postCount = await Post.countDocuments(query).exec(); // 실행한 쿼리 갯수
    ctx.set('Last-Page', Math.ceil(postCount / 10)); // 마지막 페이지
    ctx.body = posts
      .map((post) => post.toJSON()) // 입력 받은 객체를 JSON화
      .map((post) => ({
        ...post, // 기존 값
        body: removeHtmlAndShorten(post.body), // BODY만 변경
      }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const read = async (ctx) => {
  ctx.body = ctx.state.post;
};

export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const update = async (ctx) => {
  const { id } = ctx.params;
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const nextData = { ...ctx.request.body };

  if (nextData.body) {
    nextData.body = sanitizeHtml(nextData.body, sanitizeOption);
  }

  try {
    const post = await Post.findByIdAndUpdate(id, nextData, {
      new: true,
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
