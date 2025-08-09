
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Handshake, Car, IndianRupee, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Mock notifications data with target_url
const mockNotifications = [
  {
    id: 1,
    type: 'deal',
    icon: Handshake,
    title: 'New offer received',
    message: 'Mumbai Motors made an offer of ₹6.8L for your 2020 Swift Dzire',
    time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    unread: true,
    priority: 'high',
    target_url: createPageUrl("DealRoom") + `?id=TXN12345` // Mock Deal ID
  },
  {
    id: 2,
    type: 'system',
    icon: Car,
    title: 'Vehicle approved',
    message: 'Your Honda City listing is now live on marketplace',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: true,
    priority: 'medium',
    target_url: createPageUrl("VehicleDetail") + `?id=VEH98765` // Mock Vehicle ID
  },
  {
    id: 3,
    type: 'payment',
    icon: IndianRupee,
    title: 'Payment received',
    message: 'Escrow payment of ₹2.4L received for deal #1234',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    unread: false,
    priority: 'medium',
    target_url: createPageUrl("PaymentDetail") + `?id=PYM67890` // Example payment detail page
  },
  {
    id: 4,
    type: 'alert',
    icon: AlertTriangle,
    title: 'Document required',
    message: 'Upload RC copy for your Creta listing to complete verification',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    unread: false,
    priority: 'high',
    target_url: createPageUrl("KYBWizard") // Link to KYB
  }
];

export default function NotificationsCenter({ onClose, dealer }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'deal': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      case 'alert': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Link
                  key={notification.id}
                  to={notification.target_url}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`block p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-slate-100 ${getNotificationColor(notification.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(notification.time, { addSuffix: true })}
                        </span>
                        {notification.priority === 'high' && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t bg-slate-50">
            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
              View All Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
