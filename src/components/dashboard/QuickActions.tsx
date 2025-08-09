import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, FileText, Settings } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "List New Vehicle",
      description: "Add a vehicle to your inventory",
      icon: Plus,
      link: createPageUrl("AddVehicle"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Browse Marketplace",
      description: "Find vehicles for your customers",
      icon: Search,
      link: createPageUrl("Marketplace"),
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      title: "Generate Report",
      description: "Download inventory summary",
      icon: FileText,
      link: "#",
      color: "bg-orange-600 hover:bg-orange-700"
    },
    {
      title: "Account Settings",
      description: "Update your profile",
      icon: Settings,
      link: createPageUrl("Profile"),
      color: "bg-slate-600 hover:bg-slate-700"
    }
  ];

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.link}>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-slate-50">
              <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-slate-500">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}