import { useState, useEffect } from "react";
import { PhoneOff, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function InterruptWidget() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const handleToggleCall = () => {
    setIsCallActive(!isCallActive);
  };

  // Demo logic to simulate agent speaking patterns
  useEffect(() => {
    if (isCallActive) {
      const interval = setInterval(() => {
        setIsAgentSpeaking(prev => !prev);
      }, 3000); // Toggle every 3 seconds for demo

      return () => clearInterval(interval);
    } else {
      setIsAgentSpeaking(false);
    }
  }, [isCallActive]);

  const getAvatarClasses = () => {
    return "w-24 h-24"; // Avatar itself stays consistent
  };

  const getAvatarContainerClasses = () => {
    if (!isCallActive) return "";
    
    if (isAgentSpeaking) {
      return "relative before:absolute before:inset-0 before:rounded-full before:bg-primary/20 before:animate-ping before:scale-110 after:absolute after:inset-0 after:rounded-full after:shadow-lg after:shadow-primary/50 after:animate-pulse-slow";
    } else {
      return "relative before:absolute before:inset-0 before:rounded-full before:shadow-lg before:shadow-primary/30 before:ring-2 before:ring-primary/20";
    }
  };

  return (
    <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-[100]">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl border w-64">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Is this response helpful?</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-slate-100 hover:bg-slate-200 opacity-50 overflow-hidden">
                <img 
                  src="/lovable-uploads/e8e9de59-d66f-4ef1-8c03-4aa1339e0780.png" 
                  alt="thumbs up" 
                  className="w-10 h-10 object-cover scale-125"
                />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-slate-100 hover:bg-slate-200 opacity-50 overflow-hidden">
                <img 
                  src="/lovable-uploads/40df2e1d-cad4-495c-a5ee-5525545fa3da.png" 
                  alt="thumbs down" 
                  className="w-10 h-10 object-cover scale-125"
                />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex">
          {/* Left half - Portrait image */}
          <div className="w-1/2 flex items-center justify-center p-4">
            <div className={`transition-all duration-500 ${getAvatarContainerClasses()}`}>
              <Avatar className={`transition-all duration-300 ${getAvatarClasses()} relative z-10`}>
                <AvatarImage src="/lovable-uploads/b4f45544-be19-447f-9656-9758c93ecd9e.png" alt="Morgan" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">M</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Right half - Content stacked vertically */}
          <div className="w-1/2 flex flex-col justify-center p-4 space-y-4">
            <div>
              <h3 className="font-roboto font-medium text-sm text-center">Talk to interrupt</h3>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <div className="flex justify-center">
              <Button variant="outline" size="sm" className="px-4 py-2 rounded-full text-sm" onClick={handleToggleCall}>
                {isCallActive ? <>
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End
                  </> : <>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </>}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="text-xs text-muted-foreground">
            Powered by
          </div>
        </div>
      </div>
    </div>
  );
}
