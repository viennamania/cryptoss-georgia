import { NextResponse, type NextRequest } from "next/server";


export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    userId,
  } = body;


  const application_id = process.env.SENDBIRD_APPLICATION_ID;
  const apiToken = process.env.SENDBIRD_API_TOKEN;

  // GET https://api-{application_id}.sendbird.com/v3/users/{user_id}
  /*
  Content-Type: application/json; charset=utf8
  Api-Token: {master_api_token or secondary_api_token}
  */
  const apiUrl = `https://api-${application_id}.sendbird.com/v3/users/${userId}`;

  try {
    if (!apiToken) {
      throw new Error("Sendbird API token is not set in environment variables.");
    }
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'Api-Token': apiToken,
      },
    });
    const data = await response.json();

    console.log("API response:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }

}
