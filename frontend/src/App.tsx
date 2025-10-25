import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

// Types
interface NavigationProps {
  currentView: 'chat' | 'voice';
  onNavigate: (view: 'chat' | 'voice') => void;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ViewType = 'chat' | 'voice';

// Initialize OpenAI client
// IMPORTANT: In production, use environment variables or secure configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for development/desktop apps
});

// Navigation Component
function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <nav className="navigation">
      <button
        className={`nav-btn ${currentView === 'chat' ? 'active' : ''}`}
        onClick={() => onNavigate('chat')}
      >
        💬 OpenAI Chat
      </button>
      <button
        className={`nav-btn ${currentView === 'voice' ? 'active' : ''}`}
        onClick={() => onNavigate('voice')}
      >
        🎤 Voice Assistant
      </button>
    </nav>
  );
}

// Chat Message Component
function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-content">
        {message}
      </div>
    </div>
  );
}

// OpenAI Chat View Component
function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare messages for OpenAI API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call OpenAI API directly from client
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseContent = completion.choices[0]?.message?.content || 'No response';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check your API key and internet connection.',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>💬 OpenAI Chat Assistant</h2>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="message ai-message">
            <div className="message-content">
              Hello! How can I help you today?
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg.content} 
            isUser={msg.role === 'user'} 
          />
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          className="send-btn" 
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// Voice Assistant View Component (Placeholder)
function VoiceView() {
  return (
    <div className="voice-view">
      <div className="voice-container">
        <h2>🎤 Voice Assistant</h2>
        <p className="coming-soon">Coming Soon</p>
        <div className="voice-placeholder">
          <div className="microphone-icon">🎙️</div>
          <p>Voice assistant functionality will be implemented here</p>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');

  const handleNavigate = (view: ViewType): void => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🤖 AI Assistant</h1>
      </header>

      <Navigation currentView={currentView} onNavigate={handleNavigate} />

      <main className="app-main">
        {currentView === 'chat' && <ChatView />}
        {currentView === 'voice' && <VoiceView />}
      </main>
    </div>
  );
}

export default App;