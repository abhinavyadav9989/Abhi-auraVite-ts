import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Handshake, Search, Clock, CheckCircle } from "lucide-react";

export default function EmptyDealsState({ activeTab, hasSearch }) {
  const getEmptyStateContent = () => {
    if (hasSearch) {
      return {
        icon: Search,
        title: "No deals match your search",
        description: "Try adjusting your search terms or filters",
        action: null
      };
    }

    switch (activeTab) {
      case "active":
        return {
          icon: Handshake,
          title: "No active deals",
          description: "Start negotiating by making offers on vehicles in the marketplace",
          action: {
            text: "Browse Marketplace",
            href: createPageUrl("Marketplace")
          }
        };
      case "payment":
        return {
          icon: Clock,
          title: "No pending payments",
          description: "Deals requiring payment will appear here",
          action: null
        };
      case "completed":
        return {
          icon: CheckCircle,
          title: "No completed deals yet",
          description: "Your finished transactions will be listed here",
          action: null
        };
      default:
        return {
          icon: Handshake,
          title: "No deals found",
          description: "Get started by exploring vehicles and making offers",
          action: {
            text: "Find Vehicles",
            href: createPageUrl("Marketplace")
          }
        };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <Card className="border-dashed border-2 border-slate-200">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <IconComponent className="w-8 h-8 text-slate-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {content.title}
        </h3>
        
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          {content.description}
        </p>
        
        {content.action && (
          <Link to={content.action.href}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {content.action.text}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}