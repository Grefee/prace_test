import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { page, filter_type, filter_min_price, filter_max_price } =
      await req.json();

    const queryParams: string[] = [];

    if (typeof page === "number") {
      queryParams.push(`page=${page}`);
    }
    if (typeof filter_type === "number") {
      queryParams.push(`category_type_cb=${filter_type}`);
    }
    if (
      typeof filter_min_price === "number" &&
      typeof filter_max_price === "number"
    ) {
      queryParams.push(`price_range=${filter_min_price}-${filter_max_price}`);
    } else if (typeof filter_min_price === "number") {
      queryParams.push(`price_range=${filter_min_price}-`);
    } else if (typeof filter_max_price === "number") {
      queryParams.push(`price_range=-${filter_max_price}`);
    }
    const filterString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    //console.log(`fetching ..., https://sreality.cz/api/cs/v2/estates${filterString} `)

    const response = await fetch(
      `https://sreality.cz/api/cs/v2/estates${filterString}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error getting data: ${error.message}` },
      { status: 400 }
    );
  }
}
