
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, AlertTriangle, Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const taskIcons = {
  kyb: AlertTriangle,
  inventory: Clock,
  logistics: Truck,
  payment: CheckCircle2
};

const taskColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  low: "bg-blue-100 text-blue-700 border-blue-200"
};

export default function TasksToDo({ tasks, dealer }) {
  if (tasks.length === 0) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-green-600 rounded-full opacity-10" />
        
        <CardContent className="p-6 text-center">
          <div className="p-3 rounded-xl bg-green-600 bg-opacity-10 w-fit mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-white mb-2">
            Tasks To-Do
          </CardTitle>
          <div className="text-lg font-semibold text-green-600 mb-2">All Clear! 👌</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">No pending tasks</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-slate-600 rounded-full opacity-10" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-slate-600 bg-opacity-10">
            <CheckCircle2 className="w-6 h-6 text-slate-600" />
          </div>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white mb-1">
              Tasks To-Do
            </CardTitle>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">items pending</div>
          </div>
          
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => {
              const Icon = taskIcons[task.type] || CheckCircle2;
              return (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                      {task.title}
                    </span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${taskColors[task.priority]} text-xs ml-2`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
            
            {tasks.length > 3 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
                +{tasks.length - 3} more tasks
              </div>
            )}
          </div>
          
          <Link to={createPageUrl("TaskBoard")}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50">
              Open Task Board
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
