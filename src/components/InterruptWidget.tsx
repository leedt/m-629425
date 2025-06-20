
import { useState } from "react";
import { EndCall, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function InterruptWidget() {
  return <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-[100]">
      
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
              <h3 className="font-semibold text-sm text-center rounded-full">Talk to interrupt</h3>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <Button variant="outline" size="sm" className="px-4 py-2 rounded-full text-sm">
            <EndCall className="h-4 w-4 mr-2" />
            End
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Powered by
        </div>
      </div>
    </div>;
}
