"use client";
import { useState, useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RatingChip from "../common/RatingChip";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [cursor, setCursor] = useState("");
  const [searchSessionId, setSearchSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScrollFetch, setIsScrollFetch] = useState(false); // Flag for scroll fetching
  const [hasSearched, setHasSearched] = useState(false); // Flag to detect if search has been performed

  const loader = useRef(null); // Ref for the loader element

  // Handle new search, reset everything
  const handleSearch = () => {
    setPage(1); // Reset page
    setOffset(0); // Reset offset
    setCursor(""); // Reset cursor
    setSearchSessionId(""); // Reset search session ID
    setProducts([]); // Clear previous products
    setIsScrollFetch(false); // Reset scroll fetch flag
    setHasSearched(true); // Mark search as performed
    loadProducts(true); // Call API to load products for new search
  };

  // Load products from API
  const loadProducts = async (isNewSearch = false) => {
    if (loading || !searchTerm) return; // Prevent multiple fetches at the same time
    setLoading(true);

    const payload = {
      query: searchTerm,
      type: "text_search",
      page: isScrollFetch && !isNewSearch ? page : 1, // Use incremented page only for scroll
      offset: isScrollFetch && !isNewSearch ? offset : 0, // Use offset only for scroll
      limit: 20,
      cursor: isNewSearch || page === 1 ? "" : cursor, // Reset cursor for new search
      search_session_id: isNewSearch || page === 1 ? "" : searchSessionId, // Reset session ID for new search
      isDevicePhone: false,
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();

      setCursor(res?.cursor); // Update cursor
      setSearchSessionId(res?.search_session_id); // Update session ID
      setSearchTerm(res?.corrected_search_term || searchTerm); // Update search term if corrected

      if (res?.catalogs.length !== 0) {
        setProducts((prevProducts: any) => [...prevProducts, ...res?.catalogs]);
      } else {
        console.log("No more products to load.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // IntersectionObserver to detect scroll to bottom
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasSearched) {
          // Only trigger on scroll after a search has been made
          setIsScrollFetch(true); // Set scroll fetch flag
          setPage((prevPage) => prevPage + 1); // Increment page
          setOffset((prevOffset) => prevOffset + 20); // Increment offset
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [loading, hasSearched]);

  useEffect(() => {
    // Only load products on page change if it's triggered by scroll
    if (isScrollFetch && page > 1) {
      loadProducts(false); // Fetch next page of products on scroll
    }
  }, [page]);

  const openProductDetail = (slug: any, id: any) => {
    window.open(`https://www.meesho.com/${slug}/p/${id}`, "_blank");
  };

  return (
    <div className="bg-white p-3 sm:p-8 rounded-lg w-full">
      <div>
        <div className="space-y-4">
          <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            InputProps={{
              style: { backgroundColor: "white" },
            }}
            className="border border-gray-300 rounded focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2"
          >
            Search
          </Button>
        </div>
      </div>
      <div className="my-5">
        <Grid container spacing={1}>
          {products.map((product: any, i: number) => (
            <Grid item key={`${product.id}-${i}`} xs={6} sm={4} md={3} lg={2}>
              <Card
                onClick={() =>
                  openProductDetail(product.original_slug, product.product_id)
                }
                className="cursor-pointer h-[300px] sm:h-[400px] pb-4"
              >
                <div className="h-[60%] overflow-hidden">
                  {/* Image Slider */}
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    adaptiveHeight={true}
                  >
                    {product.product_images.map((img: any) => (
                      <CardMedia
                        component="img"
                        key={img.id}
                        image={img.url}
                        alt={`Image ${img.id}`}
                        className="h-full w-full object-cover"
                      />
                    ))}
                  </Slider>
                </div>
                <div>
                  <CardContent className="flex flex-col sm:space-y-2 py-0 px-2">
                    {/* Price */}
                    <span className="text-xl font-bold text-green-600 mt-1 sm:mt-3">
                      ₹{product?.min_catalog_price}
                    </span>

                    {/* Product Name */}
                    <span className="text-xs sm:text-base font-semibold break-words line-clamp-1">
                      {product?.name}
                    </span>

                    {/* hero Product Name */}
                    <span className="text-xs font-semibold break-words line-clamp-1">
                      {product?.hero_product_name}
                    </span>

                    {/* Rating */}
                    <RatingChip
                      rating={product?.catalog_reviews_summary?.average_rating}
                      review={product?.catalog_reviews_summary?.rating_count}
                    />
                    {/* Chips (Rating, Ad, Sort State) */}
                    <div className="flex items-center flex-wrap space-x-2 mt-1 sm:mt-2">
                      {/* Ad Chip */}
                      {product?.isAdProduct && (
                        <span className="text-xs font-semibold px-2 py-1 bg-yellow-500 text-white rounded-full">
                          Ad
                        </span>
                      )}

                      {/* Sort State Chip */}
                      <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-800 rounded-full">
                        {product?.state_code}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
      {loading && (
        <div className="flex justify-center">
          <CircularProgress className="my-5" />
        </div>
      )}
      {/* Loader for detecting scroll to bottom */}
      <div ref={loader} className="my-5 mx-auto">
        Loading more products...
      </div>
    </div>
  );
}

export default App;
