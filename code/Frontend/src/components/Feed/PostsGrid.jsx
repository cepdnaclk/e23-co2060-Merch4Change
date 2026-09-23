import { useEffect, useState } from "react";
import "./PostsGrid.css";
import Post from "../Post/Post";
import PostViewer from "../PostViewer/PostViewer";
import { getRecommendedPosts } from "../../api/postsService";

function PostsGrid() {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getRecommendedPosts()
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data?.posts || []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="posts">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post.id || post._id}
            post={post}
            onOpen={setActivePost}
          />
        ))
      ) : (
        <Post />
      )}

      {activePost && (
        <PostViewer post={activePost} onClose={() => setActivePost(null)} />
      )}
    </div>
  );
}

export default PostsGrid;
