import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Paperclip,
  Bell,
  BellOff,
  Settings,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PhoneCall,
  Video,
  MessageCircle
} from 'lucide-react';
import { Transaction, Dealer } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  type: 'text' | 'offer' | 'document' | 'system';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  read: boolean;
}

import { Database } from '@/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type User = Database['auth']['Tables']['users']['Row'];

interface DealerCommunicationHubProps {
  transaction: Transaction;
  currentUser: User;
  onCommunicationUpdate: (updatedData: Transaction) => void;
}

const DealerCommunicationHub: React.FC<DealerCommunicationHubProps> = ({
  transaction,
  currentUser,
  onCommunicationUpdate
}) => {
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    urgent_only: false
  });
  const [selectedContactMethod, setSelectedContactMethod] = useState<'chat' | 'call' | 'email'>('chat');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Determine if current user is buyer or seller
  const isBuyer = currentUser?.id === transaction?.buyer_id;
  const isSeller = currentUser?.id === transaction?.seller_id;
  const otherParty = isBuyer ? transaction?.seller_id : transaction?.buyer_id;

  useEffect(() => {
    loadCommunicationHistory();
    scrollToBottom();
  }, [transaction]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCommunicationHistory = async () => {
    try {
      // In a real implementation, this would load from a messages table
      // For now, we'll simulate with transaction timeline data
      const timelineMessages = Array.isArray(transaction?.timeline)
        ? (transaction.timeline as Array<{
            timestamp: string;
            status: string;
            user_id: string;
            details?: string;
            message?: string;
          }>).map((entry, index: number) => ({
        id: `msg_${index}`,
        sender_id: entry.user_id,
        sender_name: getUserName(entry.user_id),
        content: entry.details || entry.message || 'System message',
        timestamp: entry.timestamp,
        type: (entry.status === 'message' ? 'text' : 'system') as 'text' | 'document' | 'offer' | 'system',
        read: true // Assume all timeline messages are read
      }))
        : [];

      setMessages(timelineMessages);
    } catch (error) {
      console.error('Error loading communication history:', error);
    }
  };

  const getUserName = (userId: string) => {
    if (userId === transaction?.buyer_id) return 'Buyer';
    if (userId === transaction?.seller_id) return 'Seller';
    return 'Unknown';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const messageData = {
        content: newMessage,
        sender_id: currentUser.id,
        timestamp: new Date().toISOString(),
        type: 'text',
        read: false
      };

      // Update transaction with new message
      const newTimelineEntry = {
        timestamp: new Date().toISOString(),
        status: 'message',
        user_id: currentUser.id,
        details: newMessage,
        message: newMessage
      };

      const currentTimeline = Array.isArray(transaction.timeline) ? transaction.timeline : [];
      const updatedTimeline = [...currentTimeline, newTimelineEntry];
      const updatedTransaction = await Transaction.update(transaction.id, {
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      });

      // Add to local messages
      const newMsg: CommunicationMessage = {
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: getUserName(currentUser.id),
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        read: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      onCommunicationUpdate(updatedTransaction);

      toast({
        title: 'Message Sent',
        description: 'Your message has been delivered.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message Failed',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleContactMethod = async (method: 'call' | 'email') => {
    try {
      const otherPartyInfo = await Dealer.get(otherParty);

      if (method === 'call' && otherPartyInfo?.phone) {
        // In a real app, this would initiate a call through Twilio or similar
        window.open(`tel:${otherPartyInfo.phone}`, '_self');
        toast({
          title: 'Initiating Call',
          description: `Calling ${otherPartyInfo.business_name}...`,
        });
      } else if (method === 'email' && otherPartyInfo?.email) {
        const subject = `Regarding Transaction: ${transaction?.id}`;
        const userMetaData = currentUser?.raw_user_meta_data as { full_name?: string } | null;
        const userName = userMetaData?.full_name || currentUser?.email;
        const body = `Dear ${otherPartyInfo.business_name},\n\nI am contacting you regarding our ongoing transaction.\n\nTransaction ID: ${transaction?.id}\n\nBest regards,\n${userName}`;
        window.open(`mailto:${otherPartyInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      }
    } catch (error) {
      console.error('Error handling contact method:', error);
      toast({
        title: 'Contact Failed',
        description: 'Unable to initiate contact. Please try manually.',
        variant: 'destructive'
      });
    }
  };

  const updateNotificationSettings = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    toast({
      title: 'Settings Updated',
      description: 'Notification preferences have been saved.',
    });
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'offer': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'system': return <Settings className="w-4 h-4 text-slate-600" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const unreadCount = messages.filter(msg => !msg.read && msg.sender_id !== currentUser?.id).length;

  return (
    <div className="space-y-6">
      {/* Communication Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Communication Hub
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <Select value={selectedContactMethod} onValueChange={(value: 'chat' | 'call' | 'email') => setSelectedContactMethod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </div>
                </SelectItem>
                <SelectItem value="call">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Contact Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleContactMethod('call')}
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button
              variant="outline"
              onClick={() => handleContactMethod('email')}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedContactMethod('chat')}
              className={`gap-2 ${selectedContactMethod === 'chat' ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Messages
            <Badge variant="outline">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-md ${message.sender_id === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {message.sender_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`space-y-1 ${message.sender_id === currentUser?.id ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{message.sender_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                          </Badge>
                          {!message.read && message.sender_id !== currentUser?.id && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.sender_id === currentUser?.id
                            ? 'bg-blue-50 text-blue-900'
                            : 'bg-slate-50 text-slate-900'
                        }`}>
                          <div className="flex items-start gap-2">
                            {getMessageTypeIcon(message.type)}
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                                      <Paperclip className="w-3 h-3" />
                                      <span className="text-xs">{attachment.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="mt-4 border-t pt-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.email}
                onChange={(e) => updateNotificationSettings('email', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">SMS notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.sms}
                onChange={(e) => updateNotificationSettings('sms', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Push notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.push}
                onChange={(e) => updateNotificationSettings('push', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Urgent only</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.urgent_only}
                onChange={(e) => updateNotificationSettings('urgent_only', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealerCommunicationHub;
