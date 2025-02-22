// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [started, setStarted] = useState(false);
  const [selectedNumParties, setSelectedNumParties] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');

  // When resolveme button is clicked, mark the session as started.
  const handleResolvemeClick = () => {
    setStarted(true);
  };

  // Once the user selects the number of parties, save the selection
  // and insert an initial mediator message that includes this info.
  const handleNumPartiesSelect = (num) => {
    setSelectedNumParties(num);
    const initialMessage = `This conversation involves ${num} parties. Please describe the conflict and issues at hand.`;
    addMessage("mediator", initialMessage);
  };

  const addMessage = (sender, text) => {
    setConversation(prev => [...prev, { sender, text }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    addMessage("user", userInput);

    try {
      const response = await axios.post('/api/mediator', {
        conversation,
        userMessage: userInput,
        numParties: selectedNumParties
      });
      const mediatorReply = response.data.message;
      addMessage("mediator", mediatorReply);
    } catch (error) {
      console.error("Error in mediation API:", error);
      addMessage("mediator", "Sorry, I couldn't process that. Please try again.");
    }
    setUserInput('');
  };

  // Initial view: show only the resolveme button.
  if (!started) {
    return (
      <div class = "mainResolveMeDiv" style={{ textAlign: 'center', marginTop: '50px' }}>
        <button class = "mainResolveMeButton"
          onClick={handleResolvemeClick}
          style={{
            borderRadius: '100%',
            border: '4px',
            padding: '20px',
            fontSize: '24px',
            fontFamily: "inherit"
          }}
        >
          resolveme
        </button>
      </div>
    );
  }

  // After resolveme is clicked but before party selection is made, show party selection.
  if (started && !selectedNumParties) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Select the number of parties involved:</h2>
        <div>
          <button onClick={() => handleNumPartiesSelect(2)} style={{ margin: '10px', border: '4px', padding: '10px'
          }}>2</button>
          <button onClick={() => handleNumPartiesSelect(3)} style={{ margin: '10px', border: '4px', padding: '10px' }}>3</button>
          <button onClick={() => handleNumPartiesSelect(4)} style={{ margin: '10px', border: '4px', padding: '10px' }}>4</button>
        </div>
      </div>
    );
  }

  // Main chat interface after party selection.
  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Conflict Resolution Chat</h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '400px',
          overflowY: 'scroll',
          marginBottom: '10px'
        }}
      >
        {conversation.map((msg, index) => (
          <div key={index} style={{ margin: '10px 0' }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Your message..."
          style={{ flexGrow: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Send</button>
      </form>
    </div>
  );
}

export default App;
