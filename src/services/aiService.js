export async function chatWithAI(message, history = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat Service Error:', error);
    throw error;
  }
}
