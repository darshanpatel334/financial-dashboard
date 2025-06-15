exports.handler = async function (event, context) {
  const NOTION_TOKEN = process.env.NOTION_SECRET;
  const DATABASE_ID = "213907ff129980c6ac0fdcec0496a810";

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Check if token is available
  if (!NOTION_TOKEN) {
    console.error('NOTION_SECRET environment variable is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: "Server configuration error: Missing Notion token",
        error: "NOTION_SECRET not configured"
      })
    };
  }

  try {
    console.log('Fetching from Notion database:', DATABASE_ID);
    
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sorts: [{ property: "Date", direction: "descending" }]
      })
    });

    console.log('Notion API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion API error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          message: "Failed to fetch from Notion API",
          error: errorText,
          status: response.status
        })
      };
    }

    const data = await response.json();
    console.log('Successfully fetched', data.results?.length || 0, 'blog posts');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.results || [])
    };
  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: "Failed to fetch blog posts",
        error: error.message
      })
    };
  }
}; 