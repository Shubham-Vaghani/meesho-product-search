import React, { useState, useEffect, useRef, useMemo } from "react";
import { Grid } from "@mui/material";
import ProductCard from "./ProductCard";

interface VirtualizedGridProps {
  products: any[];
  onProductClick: (slug: string, id: string) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const ITEMS_PER_ROW = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
};

const CARD_HEIGHT = 350; // Approximate card height
const BUFFER_SIZE = 5; // Number of rows to render outside viewport

const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  products,
  onProductClick,
  containerRef,
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerHeight, setContainerHeight] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate items per row based on screen size
  const itemsPerRow = useMemo(() => {
    if (typeof window === "undefined") return 2;

    const width = window.innerWidth;
    if (width < 640) return 2; // xs
    if (width < 768) return 3; // sm
    if (width < 1024) return 4; // md
    return 6; // lg
  }, []);

  // Calculate total rows needed
  const totalRows = Math.ceil(products.length / itemsPerRow);

  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;

      const container = containerRef?.current || window;
      const scrollTop =
        container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;

      const startRow = Math.max(
        0,
        Math.floor(scrollTop / CARD_HEIGHT) - BUFFER_SIZE
      );
      const endRow = Math.min(
        totalRows,
        startRow + Math.ceil(containerHeight / CARD_HEIGHT) + BUFFER_SIZE * 2
      );

      const startIndex = startRow * itemsPerRow;
      const endIndex = Math.min(products.length, endRow * itemsPerRow);

      setVisibleRange({ start: startIndex, end: endIndex });
    };

    const updateContainerHeight = () => {
      if (containerRef?.current) {
        setContainerHeight(containerRef.current.clientHeight);
      } else {
        setContainerHeight(window.innerHeight);
      }
    };

    // Initial setup
    updateContainerHeight();
    handleScroll();

    // Event listeners
    const scrollElement = containerRef?.current || window;
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      updateContainerHeight();
      handleScroll();
    });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, [products.length, containerHeight, itemsPerRow, totalRows, containerRef]);

  // Get visible products
  const visibleProducts = useMemo(() => {
    return products.slice(visibleRange.start, visibleRange.end);
  }, [products, visibleRange]);

  const totalHeight = totalRows * CARD_HEIGHT;
  const offsetY = Math.floor(visibleRange.start / itemsPerRow) * CARD_HEIGHT;

  return (
    <div
      ref={gridRef}
      style={{
        height: totalHeight,
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `translateY(${offsetY}px)`,
          position: "absolute",
          width: "100%",
        }}
      >
        <Grid container spacing={1}>
          {visibleProducts.map((product, index) => (
            <Grid
              item
              key={`${product.id}-${visibleRange.start + index}`}
              xs={6}
              sm={4}
              md={3}
              lg={2}
            >
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                index={visibleRange.start + index}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default VirtualizedGrid;
