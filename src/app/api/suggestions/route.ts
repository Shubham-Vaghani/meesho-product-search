import { NextRequest, NextResponse } from "next/server";

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

    // Call Meesho's autosuggest API
    const response = await fetch(
      `https://www.meesho.com/api/v1/search/autosuggest?prefix=${encodeURIComponent(
        prefix
      )}`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        // Add timeout
        signal: AbortSignal.timeout(8000), // 8 seconds timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Meesho API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract suggestions from the response
    const suggestions = data?.payload?.suggestions || [];

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
