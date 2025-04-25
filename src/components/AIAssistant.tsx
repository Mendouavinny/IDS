import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import { CONFIG } from '../config/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isLoading?: boolean;
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'assistant', 
      text: "Bonjour! Je suis votre assistant en sécurité réseau. Posez-moi vos questions sur les firewalls, VPN ou détection d'intrusions." 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const resetChat = () => {
    setMessages([
      { 
        sender: 'assistant', 
        text: "Conversation réinitialisée. Comment puis-je vous aider avec la sécurité réseau?" 
      }
    ]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { sender: 'user' as const, text: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Add loading message
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'assistant', text: '...', isLoading: true }]);
    
    try {
      // Replace with actual API call
      const prompt = CONFIG.PROMPT_TEMPLATE.replace("{QUESTION}", userMessage.text);
      const response = await fetch(`https://api-inference.huggingface.co/models/${CONFIG.HF_MODEL}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${CONFIG.HF_API_KEY}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI model');
      }

      const data = await response.json();
      const aiResponse = data[0]?.generated_text || "Je n'ai pas pu générer de réponse.";
      
      // Remove loading message and add AI response
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({ sender: 'assistant', text: aiResponse })
      );
    } catch (error) {
      console.error('Error querying AI model:', error);
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({ 
          sender: 'assistant', 
          text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard." 
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button 
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all z-50"
        aria-label="Ouvrir l'assistant IA"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat window */}
      <div className={`fixed bottom-0 right-0 w-full sm:w-96 h-[500px] bg-white rounded-t-lg shadow-xl z-50 transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      } flex flex-col`}>
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="font-medium">Assistant de Sécurité Réseau</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={resetChat}
              className="p-1 rounded-full hover:bg-primary-500 transition-colors"
              aria-label="Réinitialiser la conversation"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={toggleAssistant}
              className="p-1 rounded-full hover:bg-primary-500 transition-colors"
              aria-label="Fermer l'assistant"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${
                message.sender === 'user' 
                  ? 'ml-auto' 
                  : 'mr-auto'
              }`}
            >
              <div className={`p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-primary-100 text-dark-800 ml-auto'
                  : 'bg-white text-dark-800 border border-dark-200'
              } ${message.isLoading ? 'animate-pulse' : ''}`}>
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question ici..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-2 bg-primary-600 text-white rounded-r-md ${
                isLoading || !inputText.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-700'
              }`}
              disabled={isLoading || !inputText.trim()}
              aria-label="Envoyer le message"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AIAssistant;