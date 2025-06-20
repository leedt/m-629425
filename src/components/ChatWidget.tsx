import { useState } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{
    id: 1,
    sender: "Morgan",
    text: "Hello! I'm Morgan, your ACME Realty virtual agent. What's your name?",
    timestamp: new Date(),
    isConsultant: true
  }]);
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        text: message,
        timestamp: new Date(),
        isConsultant: false
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Simulate consultant response
      setTimeout(() => {
        const response = {
          id: messages.length + 2,
          sender: "Morgan",
          text: "Thank you! I'd be happy to help you find the perfect luxury villa. What type of property are you looking for?",
          timestamp: new Date(),
          isConsultant: true
        };
        setMessages(prev => [...prev, response]);
      }, 1500);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  if (!isOpen) {
    return <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>;
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pt-16">
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
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => <div key={msg.id} className={cn("flex", msg.isConsultant ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-xs rounded-2xl px-4 py-2 text-sm", msg.isConsultant ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" : "bg-primary text-white")}>
                {msg.text}
              </div>
            </div>)}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your response..." className="flex-1" />
            <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
