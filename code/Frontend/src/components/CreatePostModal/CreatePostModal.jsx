import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { createPost } from "../../api/postsService";
import { useTheme } from "../../context/ThemeContext";
import "./CreatePostModal.css";

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode, resolvedTheme } = useTheme();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("You can only upload up to 5 images.");
      return;
    }
    setError(null);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      setError("Post content or at least one image is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content);
      images.forEach((img) => {
        formData.append("images", img);
      });

      const response = await createPost(formData);
      if (response.data?.success || response.status === 201) {
        setContent("");
        setImages([]);
        if (onSuccess) onSuccess(response.data?.post || response.data);
        onClose();
      }
    } catch (err) {
      console.error("Create post error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`create-post-overlay ${isDarkMode ? "dark" : ""}`}
      data-theme={resolvedTheme}
    >
      <div className="create-post-modal">
        <div className="create-post-header">
          <h2>Create a Post</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <textarea
            className="create-post-textarea"
            placeholder="What do you want to share?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            rows={4}
          />

          {images.length > 0 && (
            <div className="create-post-image-preview">
              {images.map((img, index) => (
                <div key={index} className="preview-item">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                    disabled={isLoading}
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="create-post-error">{error}</div>}

          <div className="create-post-footer">
            <div className="create-post-actions">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden-file-input"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isLoading || images.length >= 5}
              />
              <button
                type="button"
                className="add-image-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || images.length >= 5}
              >
                <ImageIcon size={20} />
                <span>Add Image</span>
              </button>
              <span className="image-count-text">{images.length}/5</span>
            </div>

            <button
              type="submit"
              className="submit-post-btn"
              disabled={
                isLoading || (!content.trim() && images.length === 0)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;