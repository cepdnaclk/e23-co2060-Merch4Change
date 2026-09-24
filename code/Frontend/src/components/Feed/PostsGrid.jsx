import { useEffect, useState, useCallback, useRef } from "react";
import "./PostsGrid.css";
import Post from "../Post/Post";
import PostViewer from "../PostViewer/PostViewer";
import { getRecommendedPosts, getFeedPosts } from "../../api/postsService";
import { Loader2 } from "lucide-react";

function PostsGrid() {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageToLoad = 1, append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (append) setIsLoadingMore(true);

    try {
      let res;
      try {
        res = await getRecommendedPosts({ page: pageToLoad, limit: 10 });
      } catch {
        if (typeof getFeedPosts === "function") {
          res = await getFeedPosts({ page: pageToLoad, limit: 10 }).catch(() => null);
        }
      }

      const fetchedPosts = res?.data?.posts || [];
      const more = res?.data?.pagination?.hasMore ?? (fetchedPosts.length >= 10);

      setHasMore(Boolean(more));
      setPage(pageToLoad);

      if (append) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id || p._id)));
          const uniqueIncoming = fetchedPosts.filter(
            (p) => !existingIds.has(String(p.id || p._id))
          );
          return [...prev, ...uniqueIncoming];
        });
      } else {
        setPosts(fetchedPosts);
      }
    } catch {
      if (!append) setPosts([]);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Listen for real-time dynamically created posts
  useEffect(() => {
    const handlePostCreated = (event) => {
      const newPost = event.detail;
      if (newPost) {
        setPosts((prev) => [
          newPost,
          ...prev.filter(
            (p) => String(p.id || p._id) !== String(newPost.id || newPost._id)
          ),
        ]);
      }
    };

    window.addEventListener("post-created", handlePostCreated);
    return () => window.removeEventListener("post-created", handlePostCreated);
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

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

      {hasMore && posts.length > 0 && (
        <div className="load-more-posts-wrapper">
          <button
            type="button"
            className="load-more-posts-btn"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="load-more-spinner" size={16} />
                <span>Loading more posts...</span>
              </>
            ) : (
              <span>Load More Posts</span>
            )}
          </button>
        </div>
      )}

      {activePost && (
        <PostViewer post={activePost} onClose={() => setActivePost(null)} />
      )}
    </div>
  );
}

export default PostsGrid;
