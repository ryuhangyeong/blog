import Post from './models/post';

export default function createFakeData() {
  const posts = [...Array(40).keys(0)].map((i) => ({
    title: `포스트 #${i}`,
    body: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odio iure impedit aspernatur soluta assumenda iste blanditiis laborum ratione deserunt pariatur, voluptatem sapiente delectus natus ab optio. Saepe quidem iure obcaecati?`,
    tags: ['가짜', '데이터'],
  }));

  Post.insertMany(posts, (err, docs) => {
    console.log(docs);
  });
}
