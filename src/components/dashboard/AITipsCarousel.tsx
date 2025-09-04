
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/api/integrations"; // Corrected the import path

export default function AITipsCarousel({ dealer }) {
  const [currentTip, setCurrentTip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback tips to show when AI service is unavailable
  const fallbackTips = [
  {
    id: 1,
    icon: "💡",
    text: "Consider adding more photos to increase buyer interest by up to 40%",
    action: "Add Photos",
    link: createPageUrl("Inventory"),
    priority: "medium"
  },
  {
    id: 2,
    icon: "📋",
    text: "Complete your KYB verification to build trust with potential buyers",
    action: "Complete KYB",
    link: createPageUrl("Profile"),
    priority: "high"
  },
  {
    id: 3,
    icon: "⏰",
    text: "Update your business hours to help customers know when you're available",
    action: "Update Hours",
    link: createPageUrl("Profile") + "#hours",
    priority: "low"
  }];


  const [aiTips, setAiTips] = useState(fallbackTips);

  useEffect(() => {
    // Only try to load AI tips if dealer is verified (to reduce API calls)
    if (dealer?.verification_status === 'verified') {
      loadAITips();
    }

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % aiTips.length);
    }, 8000); // Increased interval to 8 seconds

    return () => clearInterval(interval);
  }, [dealer, aiTips.length]); // Added aiTips.length to dependency array for correct interval logic

  const loadAITips = async () => {
    if (isLoading) return; // Prevent multiple simultaneous calls

    setIsLoading(true);
    try {
      // Add delay to space out requests
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await InvokeLLM({
        prompt: `Generate 3 actionable business tips for a car dealer in ${dealer?.city}, India. Focus on inventory optimization, customer engagement, and market trends. Keep tips concise and specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  icon: { type: "string" },
                  text: { type: "string" },
                  action: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["icon", "text", "action", "priority"] // Added required fields for schema validation
              }
            }
          },
          required: ["tips"] // Added required field for schema validation
        }
      });

      if (result.tips && result.tips.length > 0) {
        const enhancedTips = result.tips.map((tip, index) => ({
          id: Date.now() + index, // Use unique ID
          ...tip,
          link: createPageUrl("Marketplace") // Default link, can be refined based on tip content if LLM provides it
        }));
        setAiTips(enhancedTips);
        setHasError(false);
      } else {
        // If LLM returns no tips, use fallback and mark error
        setAiTips(fallbackTips);
        setHasError(true);
      }
    } catch (error) {
      console.error("Failed to load AI tips:", error);
      setHasError(true);

      if (error.response?.status === 429) {
        console.log("Rate limit hit for AI tips, using fallback");
      }

      // Keep using fallback tips on error
      setAiTips(fallbackTips);
    }
    setIsLoading(false);
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % aiTips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + aiTips.length) % aiTips.length);
  };

  // Ensure tip is always valid, even if aiTips becomes empty (though fallback should prevent this)
  const tip = aiTips.length > 0 ? aiTips[currentTip] : fallbackTips[0];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 dark:text-white">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span>
            {hasError ? "Business Tips" : "AI Market Insights"}
          </span>
          {isLoading &&
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          }
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Tip Content */}
          <div className="min-h-[120px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {tip.text}
                  </p>
                  {hasError &&
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Using cached recommendations
                    </p>
                  }
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                  tip.priority === 'high' ?
                  'bg-red-100 text-red-700' :
                  tip.priority === 'medium' ?
                  'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'}`
                  }>

                  {tip.priority}
                </Badge>
              </div>
              
              <Link to={tip.link}>
                <Button size="sm" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-wrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-9 rounded-md px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">



                  {tip.action}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {aiTips.map((_, index) =>
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTip ? 'bg-purple-500' : 'bg-slate-300'}`
                } />

              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTip}
                className="w-8 h-8 text-slate-400 hover:text-slate-600">

                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTip}
                className="w-8 h-8 text-slate-400 hover:text-slate-600">

                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

}