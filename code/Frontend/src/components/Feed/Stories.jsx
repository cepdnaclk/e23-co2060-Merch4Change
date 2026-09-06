import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/Context";
import "./Stories.css";
import StoryViewer from "./StoryViewer";
import story1 from "../../assets/welcome_stories/merch4change_story1_welcome.svg";
import story2 from "../../assets/welcome_stories/merch4change_story2_what_we_do.svg";
import story3 from "../../assets/welcome_stories/merch4change_story3_every_purchase.svg";
import story4 from "../../assets/welcome_stories/merch4change_story4_our_charities.svg";
import story5 from "../../assets/welcome_stories/merch4change_story5_join_the_movement.svg";
import { uploadStory, getStories } from "../../api/storyService";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATIC_STORIES = [
  { _id: "static_1", name: "Welcome", image: story1, isStatic: true },
  { _id: "static_2", name: "What We Do", image: story2, isStatic: true },
  { _id: "static_3", name: "Every Purchase", image: story3, isStatic: true },
  { _id: "static_4", name: "Our Charities", image: story4, isStatic: true },
  { _id: "static_5", name: "Join The Movement", image: story5, isStatic: true },
];

function Stories() {
  const { user } = useAuth();
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [viewerStories, setViewerStories] = useState([]);
  const [dynamicStories, setDynamicStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [seenStories, setSeenStories] = useState(() => {
    const saved = localStorage.getItem("merch4change_seen_stories");
    return saved ? JSON.parse(saved) : [];
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fileInputRef = useRef(null);
  const storiesContainerRef = useRef(null);

  const fetchStories = useCallback(async () => {
    try {
      const data = await getStories();
      if (data && data.data && data.data.stories) {
        // Map backend story format to frontend format
        const formattedStories = data.data.stories.map((story) => ({
          _id: story._id,
          name: story.userId ? `${story.userId.firstName} ${story.userId.lastName}` : "User",
          image: story.image,
          userImage: story.userId?.profileImageUrl,
          isOwnStory: user && (story.userId?._id === user._id || story.userId?._id === user.id),
          isStatic: false,
        }));
        setDynamicStories(formattedStories);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const isNewUser = user?.createdAt 
    ? (Date.now() - new Date(user.createdAt).getTime()) <= 24 * 60 * 60 * 1000 
    : false;
  
  const allStories = isNewUser ? [...dynamicStories, ...STATIC_STORIES] : [...dynamicStories];
  
  // Sort stories: unseen first, seen last
  const sortedStories = [...allStories].sort((a, b) => {
    const aSeen = seenStories.includes(a._id);
    const bSeen = seenStories.includes(b._id);
    if (aSeen && !bSeen) return 1;
    if (!aSeen && bSeen) return -1;
    return 0; // maintain original order for ties (newest first for dynamic, static order for static)
  });

  const checkScroll = () => {
    const el = storiesContainerRef.current;
    if (el) {
      const hasLeft = el.scrollLeft > 5;
      const hasRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 5;
      setCanScrollLeft(hasLeft);
      setCanScrollRight(hasRight);
    }
  };

  useEffect(() => {
    const el = storiesContainerRef.current;
    if (!el) return;

    checkScroll();
    // Run again after images / DOM settlement
    const timer = setTimeout(checkScroll, 150);

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [sortedStories.length]);

  const handleScroll = (direction) => {
    const el = storiesContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 240);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleScroll("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleScroll("right");
    }
  };

  useEffect(() => {
    if (!isHovered || activeStoryIndex !== null) return;
    const handleGlobalKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleScroll("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleScroll("right");
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isHovered, activeStoryIndex]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading story...");

    try {
      await uploadStory(formData);
      toast.success("Story uploaded!", { id: loadingToast });
      fetchStories(); // refresh stories list
    } catch (error) {
      toast.error("Failed to upload story", { id: loadingToast });
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddStoryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const markStoryAsSeen = (storyId) => {
    setSeenStories((prev) => {
      if (prev.includes(storyId)) return prev;
      const next = [...prev, storyId];
      localStorage.setItem("merch4change_seen_stories", JSON.stringify(next));
      return next;
    });
  };

  const handleStoryClick = (story, index) => {
    setViewerStories(sortedStories);
    setActiveStoryIndex(index);
    markStoryAsSeen(story._id);
  };

  return (
    <>
      <div 
        className="stories-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Stories section"
      >
        {canScrollLeft && (
          <button
            className="stories-arrow-btn stories-arrow-left"
            onClick={() => handleScroll("left")}
            aria-label="Swipe stories left"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="stories-container" ref={storiesContainerRef}>
          <div className="story-item" onClick={handleAddStoryClick} style={{ cursor: isUploading ? 'wait' : 'pointer' }}>
            <div className="story-img-container add-story">
              <span className="add-plus">{isUploading ? "..." : "+"}</span>
            </div>
            <p>Your Story</p>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: "none" }} 
              ref={fileInputRef} 
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>
          {sortedStories.map((story, index) => {
            const isSeen = seenStories.includes(story._id);
            return (
              <div
                key={story._id}
                className="story-item"
                onClick={() => handleStoryClick(story, index)}
              >
                <div className={`story-img-container ${isSeen ? 'seen-story' : 'has-story'}`}>
                  <img src={story.image} alt="story" style={{ objectFit: 'cover' }} />
                </div>
                <p>{story.name}</p>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            className="stories-arrow-btn stories-arrow-right"
            onClick={() => handleScroll("right")}
            aria-label="Swipe stories right"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {activeStoryIndex !== null && viewerStories.length > 0 && (
        <StoryViewer
          stories={viewerStories}
          initialIndex={activeStoryIndex}
          onClose={() => {
            setActiveStoryIndex(null);
            setViewerStories([]);
          }}
          onStoryChange={(newIndex, newStory) => {
            setActiveStoryIndex(newIndex);
            if (newStory) {
              markStoryAsSeen(newStory._id);
            }
          }}
        />
      )}
    </>
  );
}

export default Stories;
