const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const NOTION_TOKEN = process.env.NOTION_SECRET;
  const DATABASE_ID = "213907ff129980c6ac0fdcec0496a810";

  try {
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

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch blog posts" })
    };
  }
}; 