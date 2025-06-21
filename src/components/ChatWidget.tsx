
import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTextVapi } from "@/hooks/useTextVapi";

export default function ChatWidget() {
  const [message, setMessage] = useState("");
  const { messages, isLoading, error, sendMessage } = useTextVapi();

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20" style={{ paddingTop: '184px' }}>
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/lovable-uploads/b4f45544-be19-447f-9656-9758c93ecd9e.png" alt="Morgan" />
                <AvatarFallback className="bg-white/20 text-white">M</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Morgan</h3>
                <p className="text-xs opacity-90">ACME Realty Virtual Agent</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.sender === 'assistant' ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-xs rounded-2xl px-4 py-2 text-sm", msg.sender === 'assistant' ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" : "bg-primary text-white")}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              onKeyPress={handleKeyPress} 
              placeholder="Type your response..." 
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
