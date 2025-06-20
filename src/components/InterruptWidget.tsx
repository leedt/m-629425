import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export default function InterruptWidget() {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) {
    return null;
  }
  return <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-40">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-4 w-64 border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Is this response helpful?</span>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200">
              👍
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200">
              👎
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
              <h3 className="font-semibold text-sm text-center rounded-full"> Call End</h3>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
            <X className="h-4 w-4 mr-2" />
            End
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Powered by
        </div>
      </div>
    </div>;
}