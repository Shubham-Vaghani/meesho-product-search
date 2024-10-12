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

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [cursor, setCursor] = useState("");
  const [searchSessionId, setSearchSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const loader = useRef(null); // Ref for the loader element

  const handleSearch = () => {
    // Reset to first page on new search
    setProducts([]);
    setPage(1); // Reset page to 1
    setOffset(0); // Reset offset to 0
    setCursor(""); // Reset cursor
    loadProducts(); // Load products based on search term
  };

  const loadProducts = async () => {
    if (loading) return; // Prevent multiple fetches

    setLoading(true);

    const payload = {
      query: searchTerm,
      type: "text_search",
      page: page,
      offset: offset,
      limit: 20,
      cursor: cursor,
      search_session_id: searchSessionId,
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

      setCursor(res?.cursor);
      setSearchSessionId(res?.search_session_id);
      if (res?.catalogs.length !== 0) {
        setProducts((prevProducts: any) => [...prevProducts, ...res?.catalogs]);
      } else {
        // Stop loading if no more products
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
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // Increment page when reaching bottom
          setOffset((prevOffset) => prevOffset + 20);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, []);

  useEffect(() => {
    if (page > 1 && searchTerm) {
      loadProducts(); // Fetch next page when page changes
    } else {
      setPage(1);
      setOffset(0);
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
          {products.map((product: any, i: number) => (
            <Grid item key={`${product.id}-${i}`} xs={12} sm={6} md={4} lg={3}>
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
