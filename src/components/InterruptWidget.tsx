import { useState } from "react";
import { PhoneOff, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function InterruptWidget() {
  const [isCallActive, setIsCallActive] = useState(false);

  const handleToggleCall = () => {
    setIsCallActive(!isCallActive);
  };

  return (
    <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-[100]">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-4 w-64 border">
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/lovable-uploads/b4f45544-be19-447f-9656-9758c93ecd9e.png" alt="Morgan" />
              <AvatarFallback className="bg-primary/10 text-primary">M</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-roboto font-medium text-sm text-center rounded-full">Talk to interrupt</h3>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
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
        
        <div className="mt-2 text-xs text-muted-foreground">
          Powered by
        </div>
      </div>
    </div>
  );
}
