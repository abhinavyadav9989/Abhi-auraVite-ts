import { supabase } from '@/api/supabaseClient';

export interface CreateNotificationData {
  user_id: string;
  type: 'counter_offer' | 'new_deal' | 'message' | 'status_change';
  title: string;
  message: string;
  deal_id?: string;
  related_user_id?: string;
  metadata?: any;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createCounterOfferNotification(
    buyerId: string,
    sellerId: string,
    dealId: string,
    amount: number,
    sellerName: string
  ) {
    const formatPrice = (amount: number) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${(amount / 1000).toFixed(0)}K`;
    };

    return this.createNotification({
      user_id: buyerId,
      type: 'counter_offer',
      title: 'New Counter Offer',
      message: `Got counter offer from ${sellerName} at ${formatPrice(amount)}`,
      deal_id: dealId,
      related_user_id: sellerId,
      metadata: { amount, sellerName }
    });
  }

  static async createNewDealNotification(
    buyerId: string,
    sellerId: string,
    dealId: string,
    vehicleTitle: string,
    sellerName: string
  ) {
    return this.createNotification({
      user_id: buyerId,
      type: 'new_deal',
      title: 'New Deal Created',
      message: `New deal from ${sellerName} for ${vehicleTitle}`,
      deal_id: dealId,
      related_user_id: sellerId,
      metadata: { vehicleTitle, sellerName }
    });
  }

  static async createMessageNotification(
    recipientId: string,
    senderId: string,
    dealId: string,
    senderName: string,
    messagePreview: string
  ) {
    return this.createNotification({
      user_id: recipientId,
      type: 'message',
      title: 'New Message',
      message: `New message from ${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      deal_id: dealId,
      related_user_id: senderId,
      metadata: { senderName, messagePreview }
    });
  }

  static async createStatusChangeNotification(
    userId: string,
    dealId: string,
    status: string,
    actorName: string
  ) {
    const statusMessages = {
      'accepted': 'Deal accepted',
      'rejected': 'Deal rejected',
      'payment_pending': 'Payment pending',
      'paid': 'Payment completed',
      'completed': 'Deal completed',
      'cancelled': 'Deal cancelled'
    };

    const message = statusMessages[status] || 'Deal status updated';
    
    return this.createNotification({
      user_id: userId,
      type: 'status_change',
      title: 'Deal Status Update',
      message: `${message} by ${actorName}`,
      deal_id: dealId,
      metadata: { status, actorName }
    });
  }

  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }
}
