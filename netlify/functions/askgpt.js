exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { message } = JSON.parse(event.body);

    // Validate the message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required and must be a non-empty string' })
      };
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // System prompt for Indian financial assistant
    const systemPrompt = "You are a helpful, non-judgmental financial assistant for Indian users. Your tone should be friendly, clear, and free from jargon. Explain concepts like SIP, insurance, budgeting, tax-saving, saving schemes, and personal finance terms using relatable Indian examples. If someone asks about something advanced, break it down in simple steps. Do not recommend specific investment products or tell users what to buy. If asked for the latest interest rates, banking rules, or limits, tell them that rates may change and they should check the official website for the latest details. If they ask for SBI home loan interest rates, reply with a general range and say 'Please verify from the official SBI website for the latest applicable rate.' Always prioritize education, not advice.";

    // Prepare the request to OpenAI
    const openAIRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    // Make the request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openAIRequest)
    });

    // Check if the OpenAI API request was successful
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to get response from AI assistant. Please try again later.' 
        })
      };
    }

    // Parse the OpenAI response
    const data = await response.json();

    // Extract the assistant's reply
    const assistantReply = data.choices?.[0]?.message?.content;

    if (!assistantReply) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'No response received from AI assistant. Please try again.' 
        })
      };
    }

    // Return the assistant's reply
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        reply: assistantReply.trim() 
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    // Handle network or other errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.' 
      })
    };
  }
}; 