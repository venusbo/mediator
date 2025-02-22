// functions/mediate.js
export async function onRequest(context) {
    const { request, env } = context;
    try {
      // Parse the incoming JSON body.
      const body = await request.json();
      const { conversation, userMessage, numParties } = body;
      
      // Build the system message including party information.
      let systemMessageContent = "You are an AI mediator using nonviolent communication to facilitate conflict resolution in a professional, warm, and empathetic tone.";
      if (numParties) {
        systemMessageContent += ` There are ${numParties} parties involved in this conversation.`;
      }
      
      // Convert the conversation into the messages format required by GPT-3.5-turbo.
      const messages = [
        { role: "system", content: systemMessageContent },
        ...conversation.map(msg => ({
            role: msg.sender === "mediator" ? "assistant" : "user",
            content: msg.text
        })),
        { role: "user", content: userMessage }
      ];
      
      // Call the OpenAI Chat Completions API using fetch.
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
        })
      });
      
      // Check for errors.
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        return new Response(JSON.stringify({ error: errorData }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const data = await openaiResponse.json();
      const aiMessage = data.choices[0].message.content.trim();
      
      return new Response(JSON.stringify({ message: aiMessage }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  