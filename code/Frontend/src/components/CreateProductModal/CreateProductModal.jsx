import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, UploadCloud } from "lucide-react";
import "./CreateProductModal.css";
import { createProduct } from "../../api/productsService";
import { createAuction } from "../../api/auctionService";

const CreateProductModal = ({ isOpen, onClose, onProductCreated, initialListingType = "marketplace" }) => {
  const [listingType, setListingType] = useState(initialListingType); // "marketplace" | "auction"
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [bidIncrement, setBidIncrement] = useState("10");
  const [endTime, setEndTime] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setListingType(initialListingType);
    }
  }, [isOpen, initialListingType]);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 5) {
        alert("You can upload a maximum of 5 images.");
        return;
      }
      setImages((prev) => [...prev, ...filesArray]);
    }
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!productName || !description || !price) {
      setError("Please fill out all required fields.");
      return;
    }
    
    if (listingType === "auction" && !endTime) {
      setError("Please provide an end time for the auction.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", listingType === "auction" ? "1" : (stock || "1"));
    
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      // Create product first
      const res = await createProduct(formData);
      if (res.data?.success) {
        const newProduct = res.data.product;
        
        // If it's an auction, create the auction record too
        if (listingType === "auction") {
          const auctionData = {
            productId: newProduct._id,
            startPrice: Number(price),
            bidIncrement: Number(bidIncrement || 10),
            startTime: new Date().toISOString(),
            endTime: new Date(endTime).toISOString()
          };
          
          const auctionRes = await createAuction(auctionData);
          if (!auctionRes.data?.success) {
             setError("Product created, but failed to create auction: " + (auctionRes.data?.message || "Unknown error"));
             setIsLoading(false);
             return;
          }
        }

        // Success for both cases
        setProductName("");
        setDescription("");
        setPrice("");
        setStock("1");
        setBidIncrement("10");
        setEndTime("");
        setImages([]);
        setListingType("marketplace");
        if (onProductCreated) onProductCreated(newProduct);
        onClose();
      } else {
        setError(res.data?.message || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cprod-overlay" onClick={onClose}>
      <div className="cprod-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cprod-header">
          <h2>Create New Listing</h2>
          <button className="cprod-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form className="cprod-form" onSubmit={handleSubmit}>
          {error && <div className="cprod-error">{error}</div>}
          
          <div className="cprod-field">
            <label>Listing Type *</label>
            <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
              <label style={{ fontWeight: "normal", display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="marketplace" 
                  checked={listingType === "marketplace"} 
                  onChange={(e) => setListingType(e.target.value)} 
                />
                Direct Sale (Marketplace)
              </label>
              <label style={{ fontWeight: "normal", display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="auction" 
                  checked={listingType === "auction"} 
                  onChange={(e) => setListingType(e.target.value)} 
                />
                Auction
              </label>
            </div>
          </div>

          <div className="cprod-field">
            <label>Product Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Handmade Silk Scarf" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="cprod-field">
            <label>{listingType === "auction" ? "Starting Bid (USD) *" : "Price (USD) *"}</label>
            <input 
              type="number" 
              placeholder="e.g. 5000" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isLoading}
              min="0"
            />
          </div>

          {listingType === "marketplace" && (
            <div className="cprod-field">
              <label>Stock Quantity *</label>
              <input 
                type="number" 
                placeholder="e.g. 10" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>
          )}

          {listingType === "auction" && (
            <>
              <div className="cprod-field">
                <label>Bid Increment (USD) *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 100" 
                  value={bidIncrement}
                  onChange={(e) => setBidIncrement(e.target.value)}
                  disabled={isLoading}
                  min="1"
                />
              </div>
              <div className="cprod-field">
                <label>Auction End Time *</label>
                <input 
                  type="datetime-local" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isLoading}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                />
              </div>
            </>
          )}

          <div className="cprod-field">
            <label>Description *</label>
            <textarea 
              placeholder="Describe your product..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              disabled={isLoading}
            />
          </div>

          <div className="cprod-image-upload-section">
            <label>Product Images (Max 5)</label>
            <div 
              className="cprod-upload-area" 
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={32} color="#4a24e1" />
              <span>Click to browse images</span>
              <input 
                type="file" 
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>
            
            {images.length > 0 && (
              <div className="cprod-image-previews">
                {images.map((img, idx) => {
                  const previewUrl = URL.createObjectURL(img);
                  return (
                    <div className="cprod-preview-item" key={idx}>
                      <img src={previewUrl} alt={`Preview ${idx}`} onLoad={() => URL.revokeObjectURL(previewUrl)} />
                      <button 
                        type="button" 
                        className="cprod-remove-img" 
                        onClick={() => removeImage(idx)}
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cprod-footer">
            <button type="button" className="cprod-cancel-btn" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="cprod-submit-btn" disabled={isLoading || !productName || !price || !description || (listingType === "auction" && !endTime)}>
              {isLoading ? "Creating..." : (listingType === "auction" ? "Create Auction" : "Create Product")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
