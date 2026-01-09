import React, { useState, useRef, useEffect } from "react";
import apiClient from "../services/apiClient";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your Industrial AI Ops assistant. I can help you with equipment maintenance procedures, safety standards, predictive maintenance insights, and system documentation. What would you like to know?",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input, sources: [] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the real RAG API
      const response = await apiClient.askAssistant(input);

      const aiMessage = {
        sender: 'ai',
        text: response.answer || "I couldn't generate a response. Please try again.",
        sources: response.sources || [],
        hasAnswer: response.hasAnswer
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to get assistant response:', err);
      setError('Failed to connect to the assistant. Please check your connection and try again.');

      // Add error message to chat
      const errorMessage = {
        sender: 'ai',
        text: "I'm having trouble connecting to the server right now. Please try again in a moment.",
        sources: [],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleQuestion = (question) => {
    setInput(question);
  };

  const exampleQuestions = [
    "What are the normal vibration levels for pumps?",
    "How far in advance can the system predict equipment failures?",
    "What machine learning algorithms does the system use?",
    "What are the critical alarm conditions?",
    "How often should pumps be maintained?"
  ];

  return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">RAG Engineer Assistant</h2>
          <p className="text-gray-400">Powered by OpenAI GPT with Industrial Knowledge Base</p>
        </div>

        {/* Error Banner */}
        {error && (
            <div className="mb-4 bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
        )}

        {/* Example Questions */}
        {messages.length === 1 && (
            <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Example Questions:</h3>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((question, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleExampleQuestion(question)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-md transition-colors"
                    >
                      {question}
                    </button>
                ))}
              </div>
            </div>
        )}

        {/* Chat Container */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg h-[65vh] flex flex-col shadow-lg">
          {/* Messages Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message Bubble */}
                    <div className={`p-4 rounded-lg ${
                        msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : msg.isError
                                ? 'bg-red-900/50 text-red-200 border border-red-500'
                                : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>

                    {/* Sources (only for AI messages with sources) */}
                    {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase">Sources:</p>
                          {msg.sources.map((source, idx) => (
                              <div key={idx} className="bg-gray-800 border border-gray-600 rounded-md p-3">
                                <p className="text-xs font-semibold text-blue-400 mb-1">{source.source}</p>
                                <p className="text-xs text-gray-300">{source.snippet}</p>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-bounce">●</div>
                      <div className="animate-bounce delay-100">●</div>
                      <div className="animate-bounce delay-200">●</div>
                    </div>
                  </div>
                </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700 flex space-x-2">
          <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about standards, procedures, maintenance, or equipment..."
              rows={2}
              disabled={isLoading}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            >
              {isLoading ? (
                  <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Thinking...</span>
              </span>
              ) : (
                  'Send'
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 pb-3 text-xs text-gray-500 text-center">
            Responses are generated by AI and may contain inaccuracies. Always verify critical information.
          </div>
        </div>
      </div>
  );
}