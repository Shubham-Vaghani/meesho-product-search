import React, { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  style,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-gray-100 ${className}`}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-gray-400 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
