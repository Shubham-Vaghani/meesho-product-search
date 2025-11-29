// src/app/api/products/route.ts
import axios from "axios";
import { NextResponse } from "next/server";

const config = {
  headers: {
    // accept: "application/json, text/plain, */*",
    // "accept-language": "en,gu;q=0.9",
    // "cache-control": "no-cache",
    // "content-type": "application/json",
    // origin: "https://www.meesho.com",
    // pragma: "no-cache",
    // priority: "u=1, i",
    // referer:
    //   "https://www.meesho.com/search?q=varni%20enterprise&searchType=autosuggest&searchIdentifier=text_search",
    // "sec-ch-ua":
    //   '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": '"Windows"',
    // "sec-fetch-dest": "empty",
    // "sec-fetch-mode": "cors",
    // "sec-fetch-site": "same-origin",
    // "user-agent":
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  },
};

export async function POST(req: Request) {
  try {
    const payload = await req.json(); // Get the payload from the request body
    const response = await axios.post(
      "https://www.meesho.com/api/v1/products/search",
      payload, // Forward the payload to the external API
      config
    );

    return NextResponse.json(response.data); // Return the response data
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    ); // Return an error response
  }
}
