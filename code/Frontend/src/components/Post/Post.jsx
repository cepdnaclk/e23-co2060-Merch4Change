import { useState } from "react";
import "./Post.css";

import defaultUserPic from "../../assets/user.svg";
import heart from "../../assets/post_icons/heart.svg";
import redheart from "../../assets/post_icons/red-heart.svg";
import comments from "../../assets/post_icons/comments.svg";
import share from "../../assets/post_icons/share.svg";
import { useAuth } from "../../context/Context";
import { likePost } from "../../api/postsService";

function formatTimeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function authorDisplayName(author) {
  if (!author) return "Unknown";
  const fullName = `${author.firstName || ""} ${author.lastName || ""}`.trim();
  return fullName || author.userName || "Unknown";
}

function idsMatch(left, right) {
  if (left == null || right == null) return false;
  return String(left) === String(right);
}

function Post({ post, onOpen }) {
  const { user: currentUser } = useAuth();
  const isLive = Boolean(post);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [like, setLike] = useState(false);
  const [localLikes, setLocalLikes] = useState(post?.likes || []);
  const [isLiking, setIsLiking] = useState(false);

  const author = post?.userId;
  const images = post?.images || [];
  const likes = isLive ? localLikes : [];
  const isLiked = isLive
    ? likes.some((id) => idsMatch(id, currentUserId))
    : like;
  const likesCount = isLive ? likes.length : "1.2k";
  const commentsCount = isLive ? post.comments?.length || 0 : 84;

  const handleLike = async (event) => {
    event.stopPropagation();
    if (!isLive) {
      setLike((current) => !current);
      return;
    }
    if (!currentUser || isLiking) return;
    setIsLiking(true);
    try {
      const res = await likePost(post.id || post._id);
      if (res.data?.success) {
        setLocalLikes(res.data.likes || []);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className="post-card"
      onClick={isLive && onOpen ? () => onOpen(post) : undefined}
      style={isLive && onOpen ? { cursor: "pointer" } : undefined}
    >
      <div className="post-header">
        <div className="post-user-info">
          <img
            src={author?.profileImageUrl || author?.avatarUrl || defaultUserPic}
            alt="user"
            className="post-avatar"
          />
          <div className="post-meta">
            <h4>{isLive ? authorDisplayName(author) : "Zoe.Studio"}</h4>
            <span>
              {isLive
                ? formatTimeAgo(post.createdAt)
                : "2 hours ago • Milan, Italy"}
            </span>
          </div>
        </div>
        <button type="button" className="post-more-btn" aria-label="More options">
          <span>•••</span>
        </button>
      </div>

      <div className="post-description">
        <p>
          {isLive
            ? post.content
            : "The morning light in Milan just hits different. Obsessed with these new linen textures from the Summer Archive. 🇮🇹✨ #LuminousStyle #MilanFashion"}
        </p>
      </div>

      {(isLive ? images.length > 0 : true) && (
        <div className="post-image-grid">
          <div
            className="main-image"
            style={images[0] ? { backgroundImage: `url(${images[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          />
          <div className="side-images">
            <div
              className="side-image top-side"
              style={images[1] ? { backgroundImage: `url(${images[1]})` } : undefined}
            />
            <div
              className="side-image bottom-side"
              style={images[2] ? { backgroundImage: `url(${images[2]})` } : undefined}
            >
              {images.length > 3 && (
                <div className="image-overlay">+{images.length - 3} items</div>
              )}
              {!isLive && <div className="image-overlay">+4 items</div>}
            </div>
          </div>
        </div>
      )}

      <div className="post-footer">
        <div className="post-actions">
          <button type="button" onClick={handleLike} className="action-btn" disabled={isLive && isLiking}>
            {isLiked ? (
              <img src={redheart} alt="liked" className="action-icon" />
            ) : (
              <img src={heart} alt="like" className="action-icon" />
            )}
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={(event) => {
              event.stopPropagation();
              if (isLive && onOpen) onOpen(post);
            }}
          >
            <img src={comments} alt="comment" className="action-icon" />
            <span>{commentsCount}</span>
          </button>

          <button type="button" className="action-btn" onClick={(event) => event.stopPropagation()}>
            <img src={share} alt="share" className="action-icon" />
          </button>
        </div>

        {!isLive && (
          <button type="button" className="shop-look-btn">
            Shop Look
          </button>
        )}
      </div>
    </div>
  );
}

export default Post;
