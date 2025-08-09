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
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-blue-700">
              Choose an action to perform on selected deals
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive Selected
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}