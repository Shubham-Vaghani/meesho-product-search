import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix");

    if (!prefix || prefix.trim().length < 2) {
      return NextResponse.json(
        { error: "Prefix must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Call Meesho's autosuggest API using axios
    const res = await axios.get(
      `https://www.meesho.com/api/v1/search/autosuggest?prefix=${encodeURIComponent(
        prefix
      )}`
    );

    // Extract suggestions from the response
    const suggestions = res.data?.payload?.suggestions || [];

    return NextResponse.json({
      success: true,
      suggestions,
      total: suggestions.length,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);

    // Return a structured error response
    return NextResponse.json(
      {
        error: "Failed to fetch suggestions",
        success: false,
        suggestions: [],
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
