// index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/mediate', async (req, res) => {
  const { conversation, userMessage, numParties } = req.body;

  // Build the system message including the party info.
  let systemMessageContent = "You are an AI mediator using nonviolent communication to facilitate conflict resolution in a professional, warm, and empathetic tone between x amount of parties. You will need to orchestrate flow of conversation specifically referring to 1 or more of the parties involved to allow for a non violent communication style/ counsellor approach. You will need to determine when you need more information/context and when you need to asking probing questions perhaps even rhetorical questions to foster understanding, empathy and de-escalation of the conflict. You are to try and resolve the conflict within 10 messages, however it may take longer. Try and avoid providing suggestions for resolution until the 10th response. Make sure you reference the parties specifically. You can ask for the names of the parties to allow for a more personal experience. MAKE SURE YOU ALLOW BOTH PARTIES TO HAVE AN INPUT. IF YOU DONT SPLIT CONVERSATION WITH DIFFERENT PARTIES EVENLY YOU HAVE FAILED";
  if (numParties) {
    systemMessageContent += ` There are ${numParties} parties involved in this conversation.`;
  }

  // Build the messages array for GPT-3.5-turbo.
  const messages = [
    {
      role: "system",
      content: systemMessageContent
    }
  ];

  conversation.forEach((msg) => {
    // Map our sender names to API roles: "user" remains "user", "mediator" becomes "assistant"
    const role = msg.sender === "mediator" ? "assistant" : "user";
    messages.push({ role: role, content: msg.text });
  });

  // Append the current user message.
  messages.push({ role: "user", content: userMessage });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content.trim();
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error generating response' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

///


