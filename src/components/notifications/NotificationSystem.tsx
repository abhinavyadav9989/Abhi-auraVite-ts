import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  CheckCircle, 
  IndianRupee, 
  Car, 
  MessageCircle,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const NOTIFICATION_TYPES = {
  deal: {
    icon: IndianRupee,
    color: 'text-green-600 bg-green-50',
    borderColor: 'border-green-200'
  },
  inquiry: {
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-50',
    borderColor: 'border-blue-200'
  },
  system: {
    icon: Bell,
    color: 'text-slate-600 bg-slate-50',
    borderColor: 'border-slate-200'
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50',
    borderColor: 'border-red-200'
  },
  vehicle: {
    icon: Car,
    color: 'text-purple-600 bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

// Mock WebSocket connection for real-time notifications
class NotificationWebSocket {
  constructor(onNotification) {
    this.onNotification = onNotification;
    this.connect();
  }

  connect() {
    // Simulate WebSocket connection
    console.log('Connecting to notification WebSocket...');
    
    // Simulate receiving notifications
    this.interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        this.simulateNotification();
      }
    }, 10000);
  }

  simulateNotification() {
    const notifications = [
      {
        id: Date.now(),
        type: 'deal',
        title: 'New offer received',
        message: 'Mumbai Motors offered ₹6.8L for your 2020 Swift Dzire',
        timestamp: new Date().toISOString(),
        unread: true,
        actionable: true,
        priority: 'high'
      },
      {
        id: Date.now() + 1,
        type: 'inquiry', 
        title: 'Vehicle inquiry',
        message: 'Someone is interested in your Honda City listing',
        timestamp: new Date().toISOString(),
        unread: true,
        actionable: true,
        priority: 'medium'
      },
      {
        id: Date.now() + 2,
        type: 'vehicle',
        title: 'Listing approved',
        message: 'Your Maruti Baleno listing is now live on marketplace',
        timestamp: new Date().toISOString(),
        unread: true,
        actionable: false,
        priority: 'low'
      }
    ];
    
    const notification = notifications[Math.floor(Math.random() * notifications.length)];
    this.onNotification(notification);
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export default function NotificationSystem({ isOpen, onClose, currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load initial notifications
    loadNotifications();
    
    // Setup WebSocket for real-time notifications
    const websocket = new NotificationWebSocket(handleNewNotification);
    setWs(websocket);
    
    return () => {
      websocket?.disconnect();
    };
  }, []);

  const loadNotifications = () => {
    // Mock initial notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'deal',
        title: 'Counter offer received',
        message: 'Delhi Auto Hub countered with ₹5.9L for your Honda City',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unread: true,
        actionable: true,
        priority: 'high'
      },
      {
        id: 2,
        type: 'inquiry',
        title: 'Phone inquiry',
        message: 'Bangalore Motors called about your Creta listing',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unread: true,
        actionable: true,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'vehicle',
        title: 'Price suggestion',
        message: 'AI suggests reducing Swift price by ₹25K for faster sale',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        unread: false,
        actionable: true,
        priority: 'medium'
      },
      {
        id: 4,
        type: 'system',
        title: 'Weekly report ready',
        message: 'Your weekly performance report is now available',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        unread: false,
        actionable: false,
        priority: 'low'
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/aura-icon.png',
        tag: notification.id
      });
    }
    
    // Play notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(() => {}); // Ignore audio errors
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => n.unread);
    return notifications.filter(n => n.type === filter);
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = getFilteredNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600" />
              <h2 className="font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-1 overflow-x-auto">
            {['all', 'unread', 'deal', 'inquiry', 'vehicle', 'system'].map(filterType => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="whitespace-nowrap"
              >
                {filterType === 'all' ? 'All' : 
                 filterType === 'unread' ? 'Unread' :
                 filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        {unreadCount > 0 && (
          <div className="p-3 bg-slate-50 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const config = NOTIFICATION_TYPES[notification.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer ${
                    notification.unread ? 'bg-blue-25' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {notification.priority === 'high' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                        
                        {notification.actionable && (
                          <Button size="sm" variant="ghost" className="text-xs h-6">
                            View
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-slate-400 hover:text-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-slate-50">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Real-time updates active</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}