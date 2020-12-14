import { Route } from 'react-router-dom';
import PostListPage from './pages/PostListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WritePage from './pages/WritePage';
import PostPage from './pages/PostPage';

/*
  라우트 설정
  path props에 배열을 넣는 경우 하나의 컴포넌트에 여러 경로에 대응 가능
  excat props는 정확히 경로가 일치하는 경우
  excat props만 적혀있는 경우 true 값이 생략되어 축약할 수 있다.
 */
const App = () => {
  return (
    <>
      <Route component={PostListPage} path={['/@:username', '']} exact />
      <Route component={LoginPage} path="/login" />
      <Route component={RegisterPage} path="/register" />
      <Route component={WritePage} path="/write" />
      <Route component={PostPage} path="/@:username/:postId" />
    </>
  );
};

export default App;
