import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// ✅ Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyDsSvei5SyC6tp2PDinonjkxi7AvVCUsLY');

// ✅ Create one chat session that keeps context
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const chatSession = model.startChat({
  history: [
    {
      role: 'user',
      parts: [{ text: "You are AgriBot, a helpful agricultural assistant." }],
    },
    {
      role: 'model',
      parts: [{ text: "Hello! I’m AgriBot 🌱. How can I help you today?" }],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 512,
  },
});

const generateBotResponse = async (userMessage: string): Promise<string> => {
  try {
    const result = await chatSession.sendMessage(userMessage);
    const text =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!text) throw new Error('Empty Gemini response');
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I’m having trouble right now. Please try again.';
  }
};

export const CropChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I’m AgriBot 🌱. I can chat with you about crops, farming, or anything else.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await generateBotResponse(inputText);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'I am facing technical issues. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
      setInputText('');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I’m your Crop Chatbot. I can chat with you about crops, farming or anything else.",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-400" />
            Crop Chatbot
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-400">Conversational AI powered by Gemini</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto mb-4 space-y-3 chat-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-black/40 text-white border border-white/10'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />}
                  {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />}
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-black/40 text-white border border-white/10">
                <div className="flex items-start space-x-2">
                  <Bot className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about crops, farming, or anything else..."
            className="flex-1 bg-black/20 border-white/20 text-white placeholder-gray-400"
          />
          <Button onClick={sendMessage} size="sm" className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
