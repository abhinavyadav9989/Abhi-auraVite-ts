import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  deal_id?: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          // Add new notification to the top of the list
          setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    if (notification.deal_id) {
      navigate(createPageUrl('DealRoom') + `?id=${notification.deal_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'counter_offer':
        return '💰';
      case 'new_deal':
        return '🤝';
      case 'message':
        return '💬';
      case 'status_change':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'counter_offer':
        return 'text-green-600';
      case 'new_deal':
        return 'text-blue-600';
      case 'message':
        return 'text-purple-600';
      case 'status_change':
        return 'text-orange-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/30" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Dropdown */}
          <Card className="z-50 rounded-xl backdrop-blur-[100px] backdrop-saturate-150
            bg-white/90 dark:bg-slate-900/85
            border border-white/30 dark:border-white/10 ring-1 ring-white/20 dark:ring-black/30
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            fixed left-3 right-3 top-16 w-auto md:absolute md:left-auto md:right-0 md:top-12 md:w-80">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/85 rounded-t-xl backdrop-blur-[100px]">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="max-h-[65vh] md:max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 border-b border-white/20 dark:border-white/10 cursor-pointer transition-colors",
                        "hover:bg-white/80 dark:hover:bg-white/10",
                        !notification.is_read && "bg-white/90 dark:bg-slate-900/80"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.is_read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(createPageUrl('Notifications'));
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
