import { combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import auth, { authSaga } from './auth';
import loading from './loading';
import user, { userSaga } from './user';
import write, { writeSaga } from './write';

/*
  핵심은 리덕스 코드이다. 다른건 다 이해가 가는데 이 부분은 조금 미흡하다.
 */
const rootReducer = combineReducers({
  auth,
  loading,
  user,
  write,
});

export function* rootSaga() {
  yield all([authSaga(), userSaga(), writeSaga()]);
}

export default rootReducer;
