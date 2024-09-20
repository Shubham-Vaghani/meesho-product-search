"use client";
import { useState, useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { fetchProductList } from "../service/productList";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null); // Ref for the loader element

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    setProducts([]);
    loadProducts(searchTerm, 1); // Load products based on search term
  };

  const loadProducts = (searchTerm: any, page: any) => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);
    fetchProductList(searchTerm, page)
      .then((data) => {
        setProducts((prevProducts: any) => [...prevProducts, ...data.products]);
        setHasMore(data.products.length > 0); // Stop if no more products
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    // IntersectionObserver to detect scroll to bottom
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1); // Increment page when reaching bottom
        }
      },
      { threshold: 1.0 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasMore]);

  useEffect(() => {
    if (page > 1) {
      loadProducts(searchTerm, page); // Fetch next page when page changes
    }
  }, [page]);

  return (
    <div className="bg-white p-8 rounded-lg w-full">
      <div>
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Search Product
        </h1>
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
        <Grid container spacing={4}>
          {products.map((product: any) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
      {loading && <CircularProgress className="my-5" />}
      {/* Loader for detecting scroll to bottom */}
      <div ref={loader} className="my-5">
        {hasMore ? "Loading more products..." : "No more products"}
      </div>
    </div>
  );
}

export default App;
