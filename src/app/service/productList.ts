export async function fetchProductList(searchTerm: any, page: any) {
  try {
    const response = await fetch(
      "https://www.meesho.com/api/v1/products/search",
      {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en,gu;q=0.9",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchTerm, // Use search term
          type: "text_search",
          page: page, // Pass the page number
          offset: (page - 1) * 20, // Calculate offset based on page
          limit: 20,
          isDevicePhone: false,
          cursor: null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
