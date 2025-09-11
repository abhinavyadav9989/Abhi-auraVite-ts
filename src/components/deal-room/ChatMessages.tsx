import React, { useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Truck,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function ChatMessages({ messages = [], timeline = [], currentUserId, dealers = {} }) {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, timeline]);

  // Merge and sort messages and timeline events
  const allEvents = [
    ...messages.map(m => ({ ...m, eventType: 'message' })),
    ...timeline.map(t => ({ ...t, eventType: 'timeline' }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const formatPrice = (amount) => {
    if (!amount) return '';
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'offer': return IndianRupee;
      case 'counter': return TrendingUp;
      case 'accept': return CheckCircle;
      case 'reject': return AlertTriangle;
      case 'system': return Clock;
      default: return MessageCircle;
    }
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'payment_pending':
      case 'paid': return IndianRupee;
      case 'picked_up':
      case 'in_transit':
      case 'delivered': return Truck;
      case 'rto_done': return FileText;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const renderMessage = (event) => {
    const isCurrentUser = event.user_id === currentUserId;
    const dealer = dealers[event.user_id];
    const Icon = getMessageTypeIcon(event.type);

    return (
      <div key={event.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">
            {dealer?.business_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {isCurrentUser ? 'You' : (dealer?.business_name || 'User')}
            <span className="ml-2">{format(new Date(event.timestamp), 'HH:mm')}</span>
          </div>
          
          <Card className={`p-3 ${
            isCurrentUser 
              ? 'bg-blue-600 text-white' 
              : event.type === 'system' 
              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              : 'bg-white border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'
          }`}>
            <div className="flex items-start gap-2">
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {event.type === 'offer' || event.type === 'counter' ? (
                  <div>
                    <div className="font-medium">
                      {event.type === 'offer' ? 'Made an offer' : 'Counter offer'}
                    </div>
                    <div className="text-lg font-bold">
                      {formatPrice(event.amount)}
                    </div>
                    {event.content && (
                      <div className="text-sm opacity-90 mt-1">{event.content}</div>
                    )}
                  </div>
                ) : (
                  <div>{event.content}</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderTimelineEvent = (event) => {
    const Icon = getTimelineIcon(event.status);
    
    return (
      <div key={`${event.status}-${event.timestamp}`} className="flex justify-center">
        <Card className="p-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-sm">
          <div className="flex items-center gap-2 text-center">
            <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{event.details}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allEvents.map(event => 
        event.eventType === 'message' 
          ? renderMessage(event)
          : renderTimelineEvent(event)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}