import { createAction, handleActions } from 'redux-actions';

// action type을 구분하기 위해 prefix를 붙인다.
const START_LOADING = 'loading/START_LOADING'; // 로딩 시작
const FINISH_LOADING = 'loading/FINISH_LOADING'; // 로딩 끝

export const startLoading = createAction(
  START_LOADING,
  (requestType) => requestType, // 어떤 타입이 로딩 시작인지에 대한 정보
);

export const finishLoading = createAction(
  FINISH_LOADING,
  (requestType) => requestType, // 어떤 타입이 로딩 끝인지에 대한 정보
);

const initialState = {};

/*
  {
    auth/LOGIN: true or false
  }
 */
const loading = handleActions(
  {
    [START_LOADING]: (state, action) => ({
      ...state,
      [action.payload]: true, // 특정 타입 로딩 시작
    }),
    [FINISH_LOADING]: (state, action) => ({
      ...state,
      [action.payload]: false, // 특정 타입 로딩 종료
    }),
  },
  initialState,
);

export default loading;
