import "./Feed.css";
import Stories from "./Stories";
import PromoBanner from "./PromoBanner";
import PostsGrid from "./PostsGrid";

function Feed() {
  return (
    <div className="center-feed">
      <Stories />
      <PromoBanner />
      <PostsGrid />
    </div>
  );
}

export default Feed;
