export async function generateImage(prompt) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid response type:', contentType);
      return 'https://placehold.co/600x600/png?text=Art+Generation+Failed';
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('DALL-E API Error:', data);
      return 'https://placehold.co/600x600/png?text=Art+Generation+Failed';
    }

    if (!data.url) {
      console.error('No URL in response:', data);
      return 'https://placehold.co/600x600/png?text=Art+Generation+Failed';
    }

    return data.url;
  } catch (error) {
    console.error("Error generating image:", error);
    return 'https://placehold.co/600x600/png?text=Art+Generation+Failed';
  }
} 