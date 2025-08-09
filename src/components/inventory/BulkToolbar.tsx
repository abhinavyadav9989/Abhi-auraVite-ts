import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, X, Share2, ArrowUpDown } from 'lucide-react';

export default function BulkToolbar({ selectedCount, onClearSelection, onArchive, onTypeChange }) {
  return (
    <Card className="border-orange-200 bg-orange-50 sticky top-2 z-10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {selectedCount} vehicle{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onTypeChange} className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Change Type
            </Button>
            <Button variant="outline" size="sm" onClick={onArchive} className="gap-2">
              <Archive className="w-4 h-4" />
              Archive
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-2">
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}