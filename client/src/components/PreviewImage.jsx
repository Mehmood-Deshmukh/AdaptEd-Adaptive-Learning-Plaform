import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

const PreviewImage = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setLoading(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setLoading(true);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <button
        onClick={onClose}
        className="absolute z-100 cursor-pointer top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close preview"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 left-4 text-white">
        <span className="text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={images[currentIndex]}
          alt={`Preview ${currentIndex + 1}`}
          className={`
            max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300
            ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}
          `}
          onClick={toggleZoom}
          onLoad={() => setLoading(false)}
        />

        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={30} />
          </button>
        )}
        
        {currentIndex < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={30} />
          </button>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <button
            onClick={toggleZoom}
            className="p-2 hover:text-gray-300 transition-colors"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            onClick={downloadImage}
            className="p-2 hover:text-gray-300 transition-colors"
            aria-label="Download image"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewImage;