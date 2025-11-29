import React, { useState, useEffect, useRef, memo } from "react";
import { Card, CardContent, Skeleton } from "@mui/material";
import RatingChip from "../../common/RatingChip";
import ImageSlider from "./ImageSlider";
import useIntersectionObserver from "../hooks/useIntersectionObserver";

interface ProductCardProps {
  product: {
    id: string;
    original_slug: string;
    product_id: string;
    product_images: Array<{ id: string; url: string }>;
    min_catalog_price: number;
    name: string;
    hero_product_name: string;
    catalog_reviews_summary?: {
      average_rating: number;
      rating_count: number;
    };
    isAdProduct?: boolean;
    state_code: string;
    shipping_charges_adjustment?: number;
  };
  onProductClick: (slug: string, id: string) => void;
  index: number;
}

const ProductCardSkeleton = () => (
  <Card className="h-[300px] sm:h-[400px] pb-4">
    <Skeleton variant="rectangular" height="60%" />
    <CardContent className="!py-0 px-2">
      <Skeleton variant="text" width="60%" height={30} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="rectangular" width={80} height={25} />
    </CardContent>
  </Card>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  index,
}) => {
  const [imageError, setImageError] = useState(false);

  // Use optimized intersection observer hook
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
    triggerOnce: true,
  });

  const handleCardClick = () => {
    onProductClick(product.original_slug, product.product_id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!isIntersecting) {
    return (
      <div ref={targetRef as React.RefObject<HTMLDivElement>}>
        <ProductCardSkeleton />
      </div>
    );
  }

  return (
    <div ref={targetRef as React.RefObject<HTMLDivElement>}>
      <Card
        onClick={handleCardClick}
        className="cursor-pointer h-[300px] sm:h-[400px] pb-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
      >
        <div className="h-[60%] overflow-hidden relative">
          <ImageSlider
            images={product.product_images}
            className="h-full w-full"
          />
        </div>

        <CardContent className="!py-0 px-2 flex flex-col sm:space-y-2">
          {/* Price */}
          <span className="text-xl font-bold text-green-600 mt-1 sm:mt-3">
            ₹{product?.min_catalog_price?.toLocaleString() || "N/A"}
          </span>

          {/* Product Name */}
          <span
            className="text-xs sm:text-base font-semibold break-words line-clamp-1"
            title={product?.name}
          >
            {product?.name || "Unknown Product"}
          </span>

          {/* Hero Product Name */}
          <span
            className="text-xs font-semibold break-words line-clamp-1"
            title={product?.hero_product_name}
          >
            {product?.hero_product_name || ""}
          </span>

          {/* Rating */}
          {product?.catalog_reviews_summary && (
            <RatingChip
              rating={product.catalog_reviews_summary.average_rating}
              review={product.catalog_reviews_summary.rating_count}
            />
          )}

          {/* Chips (Ad, State, Shipping) */}
          <div className="flex items-center flex-wrap gap-2 mt-1 sm:mt-2">
            {product?.isAdProduct && (
              <span className="text-xs font-semibold px-2 py-1 bg-yellow-500 text-white rounded-full">
                Ad
              </span>
            )}

            {product?.state_code && (
              <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-800 rounded-full">
                {product.state_code}
              </span>
            )}

            {product?.shipping_charges_adjustment !== undefined &&
              product.shipping_charges_adjustment !== null && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    product.shipping_charges_adjustment === 0
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {product.shipping_charges_adjustment === 0
                    ? "Free Shipping"
                    : `₹${product.shipping_charges_adjustment} Shipping`}
                </span>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(ProductCard);
