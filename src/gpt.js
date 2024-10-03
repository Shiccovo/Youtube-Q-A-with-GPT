
export async function sendToChatGPT(question, transcript, apiKey) {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `Transcript of the video:\n${transcript}` },
      { role: 'user', content: question }
    ],
    max_tokens: 150,
    temperature: 0.7
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('No response from ChatGPT');
    }
  } catch (error) {
    console.error('Error communicating with ChatGPT:', error);
    throw error;
  }
}
