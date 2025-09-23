import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, FileDown, X } from "lucide-react";

export default function BulkActionBar({ 
  selectedCount, 
  onArchive, 
  onExport, 
  onClear 
}) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 dark:bg-blue-700 dark:text-blue-50">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-blue-700 dark:text-slate-200">
              Choose an action to perform on selected deals
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="gap-2 dark:border-slate-600 dark:text-slate-200"
            >
              <Archive className="w-4 h-4" />
              Archive Selected
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2 dark:border-slate-600 dark:text-slate-200"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}