import { createAction, handleActions } from 'redux-actions';
import createRequestSaga, {
  createRequestActionTypes,
} from '../lib/createRequestSaga';
import * as postAPI from '../lib/api/posts';
import { takeLatest } from 'redux-saga/effects';

/*
  리덕스 코드 다시 한번 정리해보기(반복되기에 한번만 잘 이해하면 충분하다)
 */
const [
  READ_POST,
  READ_POST_SUCCESS,
  READ_POST_FAILURE,
] = createRequestActionTypes('post/READ_POST'); // 액션 타입 생성 함수
const UNLOAD_POST = 'post/UNLOAD_POST'; // 포스트 페이지에서 벗어날 때 데이터 비우기(지우지 않으면 포스트 보는 동안 이전 데이터가 살짝 보이면서 깜빡임)

export const readPost = createAction(READ_POST, (id) => id); // { type: 'post/READ_POST', payload: id }
export const unloadPost = createAction(UNLOAD_POST); // { type: 'post/UNLOAD_POST' }

/*
  이 함수를 호출하면 내부 함수(제너레이터)가 반환된다. 이때 이 함수를 takeLatest(TYPE, 함수)로 하면 액션 생성 객체의 정보가 매개변수로 전달되고
  그 매개 변수를 이용하면 된다.
 */
const readPostSaga = createRequestSaga(READ_POST, postAPI.readPost);

export function* postSaga() {
  /*
    내부적으로 계속 감시하면서 post/READ_POST 가 실행되는가를 확인한다.
    만약에 실행된다면 액션 객체를 생성하고 그 값을 readPostSaga에 전달한다.
   */
  yield takeLatest(READ_POST, readPostSaga);
}

const initalState = {
  post: null,
  error: null,
};

const post = handleActions(
  {
    [READ_POST_SUCCESS]: (state, { payload: post }) => ({
      ...state,
      post,
    }),
    [READ_POST_FAILURE]: (state, { payload: error }) => ({
      ...state,
      error,
    }),
    [UNLOAD_POST]: () => initalState,
  },
  initalState,
);

export default post;
