import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "./StoryViewer.css";
import SaveToCollectionModal from "./SaveToCollectionModal";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";

function StoryViewer({ story, stories: passedStories, initialIndex = 0, onClose, onStoryChange }) {
  const stories = useMemo(() => {
    return passedStories && passedStories.length > 0 ? passedStories : (story ? [story] : []);
  }, [passedStories, story]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [slideDirection, setSlideDirection] = useState("none");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const touchStartXRef = useRef(null);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setSlideDirection("next");
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (onStoryChange) onStoryChange(nextIndex, stories[nextIndex]);
    } else {
      onClose();
    }
  }, [currentIndex, stories, onStoryChange, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection("prev");
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      if (onStoryChange) onStoryChange(prevIndex, stories[prevIndex]);
    }
  }, [currentIndex, stories, onStoryChange]);

  // Auto-advance timer (5s) paused while modal is open
  useEffect(() => {
    if (showSaveModal) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, showSaveModal, handleNext]);

  // Keyboard navigation: Left/Right arrows and Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, onClose]);

  // Touch swipe support (for mobile/tablets)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  if (!stories.length) return null;
  const currentStory = stories[currentIndex] || stories[0];

  return (
    <div className="sv-overlay" onClick={onClose}>
      <div className="sv-viewer-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Left arrow button */}
        {currentIndex > 0 && (
          <button
            className="sv-arrow-btn sv-arrow-btn-left"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous story"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div
          className={`sv-card ${slideDirection === "next" ? "sv-slide-next" : slideDirection === "prev" ? "sv-slide-prev" : ""}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Segmented Progress Bars */}
          <div className="sv-progress-container">
            {stories.map((s, idx) => (
              <div key={s._id || idx} className="sv-progress-track">
                <div
                  key={idx === currentIndex ? `active-${currentIndex}` : `idle-${idx}`}
                  className={`sv-progress-fill ${
                    idx < currentIndex
                      ? "sv-progress-completed"
                      : idx === currentIndex && !showSaveModal
                      ? "sv-progress-active"
                      : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <button className="sv-close" onClick={onClose} aria-label="Close story">
            ×
          </button>

          {/* Left / Right click tap zones */}
          <div
            className="sv-tap-zone sv-tap-left"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            title="Previous story"
          />
          <div
            className="sv-tap-zone sv-tap-right"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            title="Next story"
          />

          <img
            key={currentStory._id || currentIndex}
            className="sv-image"
            src={currentStory.image}
            alt={currentStory.name}
          />

          <div className="sv-label">
            {currentStory.name}
            {stories.length > 1 && (
              <span className="sv-counter"> ({currentIndex + 1}/{stories.length})</span>
            )}
          </div>

          {currentStory.isOwnStory && (
            <button
              className="sv-save-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowSaveModal(true);
              }}
              title="Save to Collection"
            >
              <Bookmark size={20} />
            </button>
          )}
        </div>

        {/* Right arrow button */}
        {currentIndex < stories.length - 1 && (
          <button
            className="sv-arrow-btn sv-arrow-btn-right"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next story"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {showSaveModal && (
        <SaveToCollectionModal
          image={currentStory.image}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}

export default StoryViewer;