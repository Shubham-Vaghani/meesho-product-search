"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  memo,
} from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  CircularProgress,
  Grid,
  Skeleton,
  Alert,
  Snackbar,
  Chip,
  Box,
  IconButton,
  InputAdornment,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import RatingChip from "../common/RatingChip";
import SearchHelpDialog from "./components/SearchHelpDialog";

// Lazy load heavy components
const ProductCard = lazy(() => import("./components/ProductCard"));
const VirtualizedGrid = lazy(() => import("./components/VirtualizedGrid"));

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionAnchorEl, setSuggestionAnchorEl] =
    useState<HTMLElement | null>(null);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const loader = useRef(null); // Ref for the loader element
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle new search, reset everything
  // Search suggestion API call
  const getSearchTermSuggestion = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/suggestions?prefix=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add timeout for better UX
          signal: AbortSignal.timeout(5000), // 5 seconds timeout
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestionList = data?.suggestions || [];
      setSuggestions(suggestionList);
      setShowSuggestions(suggestionList.length > 0);

      // Set anchor element for popper positioning
      if (searchInputRef.current) {
        setSuggestionAnchorEl(searchInputRef.current);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounced suggestion fetching
  useEffect(() => {
    // Don't fetch suggestions if:
    // 1. User has already searched and we're showing results
    // 2. Currently loading search results
    // 3. Search term is empty or too short
    if (hasSearched || loading || !searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      getSearchTermSuggestion(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, getSearchTermSuggestion, hasSearched, loading]);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) return;

    // Hide suggestions when searching
    setShowSuggestions(false);
    setSuggestions([]);

    setPage(1); // Reset page
    setOffset(0); // Reset offset
    setCursor(""); // Reset cursor
    setSearchSessionId(""); // Reset search session ID
    setProducts([]); // Clear previous products
    setIsScrollFetch(false); // Reset scroll fetch flag
    setHasSearched(true); // Mark search as performed - this will stop suggestion calls
    setError(null); // Clear any previous errors
    setRetryCount(0); // Reset retry count
    setShowError(false); // Hide error messages

    // Add to search history
    setSearchHistory((prev) => {
      const newHistory = [
        searchTerm.trim(),
        ...prev.filter((term) => term !== searchTerm.trim()),
      ];
      return newHistory.slice(0, 5); // Keep only last 5 searches
    });

    loadProducts(true); // Call API to load products for new search
  }, [searchTerm]);

  // Optimized load products with debouncing and batch processing
  const loadProducts = useCallback(
    async (isNewSearch = false) => {
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();

        // Batch state updates
        setCursor(res?.cursor || "");
        setSearchSessionId(res?.search_session_id || "");
        // Don't override the search term with corrected term to preserve user input
        // setSearchTerm(res?.corrected_search_term || searchTerm);

        if (res?.catalogs?.length > 0) {
          setProducts((prevProducts: any) => {
            // Avoid duplicate products
            const existingIds = new Set(prevProducts.map((p: any) => p.id));
            const newProducts = res.catalogs.filter(
              (p: any) => !existingIds.has(p.id)
            );
            return [...prevProducts, ...newProducts];
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching products:", error);

          const errorMessage = error.message.includes("Failed to fetch")
            ? "Network error - please check your connection"
            : error.message.includes("500")
            ? "Server error - please try again later"
            : error.message.includes("timeout")
            ? "Request timeout - please try again"
            : "Something went wrong - please try again";

          setError(errorMessage);
          setShowError(true);

          // Auto retry logic for network errors
          if (retryCount < maxRetries && !isNewSearch) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              setIsRetrying(true);
              loadProducts(isNewSearch);
            }, retryDelay * (retryCount + 1)); // Exponential backoff
          }
        }
      } finally {
        setLoading(false);
        setIsRetrying(false);
      }
    },
    [loading, searchTerm, isScrollFetch, page, offset, cursor, searchSessionId]
  );

  // Handle suggestion selection
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setSearchTerm(suggestion);
      setShowSuggestions(false);
      setSuggestions([]);

      // Auto search after selecting suggestion
      setTimeout(() => {
        // Manually trigger search with the new term
        setPage(1);
        setOffset(0);
        setCursor("");
        setSearchSessionId("");
        setProducts([]);
        setIsScrollFetch(false);
        setHasSearched(true);
        setError(null);
        setRetryCount(0);
        setShowError(false);

        // Add to search history
        setSearchHistory((prev) => {
          const newHistory = [
            suggestion.trim(),
            ...prev.filter((term) => term !== suggestion.trim()),
          ];
          return newHistory.slice(0, 5);
        });

        // Trigger the actual product search
        loadProducts(true);
      }, 100);
    },
    [loadProducts]
  );

  // Handle closing suggestions
  const handleCloseSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    // Only show suggestions if no search has been performed and we have suggestions
    if (!hasSearched && suggestions.length > 0 && searchTerm.length >= 2) {
      setShowSuggestions(true);
      if (searchInputRef.current) {
        setSuggestionAnchorEl(searchInputRef.current);
      }
    }
  }, [suggestions.length, searchTerm, hasSearched]);

  useEffect(() => {
    // Optimized IntersectionObserver for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasSearched &&
          products.length > 0
        ) {
          // Debounce multiple triggers
          const timeoutId = setTimeout(() => {
            setIsScrollFetch(true);
            setPage((prevPage) => prevPage + 1);
            setOffset((prevOffset) => prevOffset + 20);
          }, 300);

          return () => clearTimeout(timeoutId);
        }
      },
      {
        threshold: 0.5,
        rootMargin: "50px", // Trigger before element is fully visible
      }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loading, hasSearched, products.length]);

  useEffect(() => {
    // Only load products on page change if it's triggered by scroll
    if (isScrollFetch && page > 1) {
      loadProducts(false); // Fetch next page of products on scroll
    }
  }, [page]);

  const openProductDetail = useCallback((slug: any, id: any) => {
    window.open(`https://www.meesho.com/${slug}/p/${id}`, "_blank");
  }, []);

  // Enhanced search form with side-by-side layout and suggestions
  const searchForm = useMemo(
    () => (
      <div className="space-y-3">
        {/* Compact Search Bar */}
        <div className="flex gap-2 items-center">
          <ClickAwayListener onClickAway={handleCloseSuggestions}>
            <div className="flex-1 min-w-0 relative">
              <TextField
                inputRef={searchInputRef}
                id="search-input"
                variant="outlined"
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleInputFocus}
                onKeyUp={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    handleSearch();
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {loadingSuggestions && (
                        <CircularProgress size={16} className="mr-1" />
                      )}
                      {searchTerm && (
                        <IconButton
                          onClick={() => {
                            setSearchTerm("");
                            setProducts([]);
                            setHasSearched(false); // Reset search state to enable suggestions again
                            setError(null);
                            setShowSuggestions(false);
                            setSuggestions([]);
                          }}
                          size="small"
                          aria-label="clear search"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                  style: { backgroundColor: "white" },
                }}
                className="w-full border border-gray-300 rounded-l-lg focus:border-indigo-500"
                sx={{
                  minWidth: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                }}
              />

              {/* Search Suggestions Dropdown */}
              <Popper
                open={showSuggestions && suggestions.length > 0}
                anchorEl={suggestionAnchorEl}
                placement="bottom-start"
                style={{ zIndex: 1300, width: suggestionAnchorEl?.offsetWidth }}
                modifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: "viewport",
                    },
                  },
                ]}
              >
                <Paper
                  elevation={8}
                  className="max-h-64 overflow-auto border border-gray-200"
                >
                  <List dense className="py-0">
                    {suggestions.map((suggestion, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      >
                        <SearchIcon
                          className="text-gray-400 mr-3"
                          fontSize="small"
                        />
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{
                            className: "text-sm text-gray-700 line-clamp-1",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Popper>
            </div>
          </ClickAwayListener>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg disabled:opacity-50 min-w-[80px]"
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              height: "40px",
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Search"
            )}
          </Button>
          {error && retryCount < maxRetries && (
            <Tooltip title="Retry search">
              <IconButton
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  handleSearch();
                }}
                disabled={loading}
                className="text-orange-500 hover:text-orange-600"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Search tips and popular searches">
            <IconButton
              onClick={() => setShowHelpDialog(true)}
              className="text-gray-400 hover:text-indigo-600"
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Search Suggestions */}
        {searchHistory.length > 0 && !loading && (
          <Box className="flex flex-wrap gap-2 items-center">
            <TrendingIcon className="text-gray-400 text-sm" />
            <span className="text-xs text-gray-500 mr-2">Recent:</span>
            {searchHistory.slice(0, 3).map((term, index) => (
              <Chip
                key={index}
                label={term}
                size="small"
                variant="outlined"
                onClick={() => {
                  setSearchTerm(term);
                  // Auto search on click
                  setTimeout(() => handleSearch(), 100);
                }}
                className="text-xs cursor-pointer hover:bg-indigo-50"
              />
            ))}
          </Box>
        )}

        {/* Loading indicator for search */}
        {loading && (
          <Box className="flex items-center justify-center py-2">
            <CircularProgress size={16} className="mr-2" />
            <span className="text-sm text-gray-600">
              {isRetrying
                ? `Retrying... (${retryCount}/${maxRetries})`
                : "Searching for products..."}
            </span>
          </Box>
        )}
      </div>
    ),
    [
      searchTerm,
      handleSearch,
      loading,
      searchHistory,
      error,
      retryCount,
      isRetrying,
      loadingSuggestions,
      showSuggestions,
      suggestions,
      suggestionAnchorEl,
      handleInputFocus,
      handleCloseSuggestions,
      handleSuggestionClick,
    ]
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto p-2 sm:p-4">
          {/* Compact Header */}
          <div className="mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              Meesho Product Search
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Discover amazing products at unbeatable prices
            </p>
          </div>

          {/* Compact Search Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 sm:p-3">
            {searchForm}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Error Handling */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
            {retryCount < maxRetries && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setShowError(false);
                  handleSearch();
                }}
                className="ml-2"
              >
                Retry
              </Button>
            )}
          </Alert>
        </Snackbar>

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {/* Results Header */}
            {products.length > 0 && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Found {products.length}+ products for "{searchTerm}"
                </p>
                <Chip
                  label={`${products.length} loaded`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="min-h-[400px]">
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        height={350}
                        className="rounded-lg"
                      />
                    ))}
                  </div>
                }
              >
                <VirtualizedGrid
                  products={products}
                  onProductClick={openProductDetail}
                />
              </Suspense>
            </div>

            {/* No Results */}
            {!loading && hasSearched && products.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <SearchIcon sx={{ fontSize: 48 }} />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Try searching for different keywords or check your spelling
                </p>
                {searchHistory.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchHistory.slice(0, 3).map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        size="small"
                        clickable
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Infinite Scroll Loader */}
            <div
              ref={loader}
              className="my-8 text-center"
              style={{ minHeight: "50px" }}
            >
              {hasSearched && products.length > 0 && (
                <div className="text-gray-500 text-sm">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={16} />
                      "Loading more products..."
                    </div>
                  ) : (
                    "Scroll for more products"
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Welcome State */}
        {!hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-indigo-500 mb-4">
              <SearchIcon sx={{ fontSize: 64 }} />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Start Your Search
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Search for products by name, category, or brand
            </p>
            {searchHistory.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Recent searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchHistory.map((term, index) => (
                    <Chip
                      key={index}
                      label={term}
                      size="medium"
                      clickable
                      onClick={() => {
                        setSearchTerm(term);
                        handleSearch();
                      }}
                      className="hover:bg-indigo-50"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Help Dialog */}
      <SearchHelpDialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
        searchHistory={searchHistory}
        onHistoryClick={(term) => {
          setSearchTerm(term);
          handleSearch();
        }}
      />
    </div>
  );
}

export default memo(App);
