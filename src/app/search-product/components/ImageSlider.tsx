import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import LazyImage from "./LazyImage";

interface ImageSliderProps {
  images: Array<{ id: string; url: string }>;
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: images.length > 1,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false, // Changed to false for consistent height
    lazyLoad: "ondemand" as const,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    // Optimize for performance
    swipe: images.length > 1,
    arrows: false,
    autoplay: false,
    centerMode: false,
    variableWidth: false,
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <LazyImage
          src={images[0].url}
          alt={`Product image`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Slider {...sliderSettings}>
        {images.map((img, index) => (
          <div key={`${img.id}-${index}`} className="outline-none">
            <div className="h-full w-full">
              <LazyImage
                src={img.url}
                alt={`Product image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </Slider>

      {/* Image counter indicator */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {currentSlide + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
