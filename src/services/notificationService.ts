import { supabase } from '@/api/supabaseClient';

// Centralized notification type union for app-wide consistency
export type NotificationType =
  | 'welcome'
  | 'kyb_verified'
  | 'first_vehicle'
  | 'counter_offer'
  | 'new_deal'
  | 'message'
  | 'status_change'
  | 'wishlist';

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  deal_id?: string;
  related_user_id?: string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      console.log('Creating notification with data:', data);
      
      // Validate that user_id is a valid UUID (dealer.id format)
      if (!data.user_id || typeof data.user_id !== 'string') {
        throw new Error('user_id must be a valid string');
      }
      
      // Validate UUID format (dealer.id is UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.user_id)) {
        throw new Error(`Invalid dealer_id format: ${data.user_id}. Expected UUID format.`);
      }

      // Important: do not call .select() here. The sender may not have SELECT
      // permission on the inserted row (recipient-only), which would cause 403.
      // We use return=minimal to avoid a follow-up read.
      const { error } = await supabase
        .from('notifications')
        .insert([data]);

      if (error) {
        console.error('Supabase error creating notification:', error);
        throw error;
      }
      
      console.log('Notification created successfully');
      return { ok: true } as any;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Convenience helpers
  static async createWelcomeNotification(dealerId: string, dealerName?: string) {
    console.log(`🔔 NotificationService.createWelcomeNotification called with dealerId: ${dealerId}, dealerName: ${dealerName}`);
    return this.createNotification({
      user_id: dealerId, // This is actually the dealer ID, not auth user ID
      type: 'welcome',
      title: 'Welcome to Aura',
      message: `Hello${dealerName ? `, ${dealerName}` : ''}! Welcome to Aura.`,
      metadata: { dealerName }
    });
  }

  static async createKybVerifiedNotification(dealerId: string, dealerName?: string) {
    return this.createNotification({
      user_id: dealerId, // This is actually the dealer ID, not auth user ID
      type: 'kyb_verified',
      title: 'Verification Approved',
      message: `Congratulations${dealerName ? `, ${dealerName}` : ''}! Your verification is approved.`,
      metadata: { dealerName }
    });
  }

  static async createFirstVehicleNotification(dealerId: string, vehicleTitle?: string) {
    return this.createNotification({
      user_id: dealerId, // This is actually the dealer ID, not auth user ID
      type: 'first_vehicle',
      title: 'First Vehicle Added',
      message: `Congrats! Your first vehicle${vehicleTitle ? ` (${vehicleTitle})` : ''} is added.`,
      metadata: { vehicleTitle }
    });
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
    sellerId: string,    // recipient (seller who gets the notification)
    buyerId: string,     // sender (buyer who made the offer)
    dealId: string,
    vehicleTitle: string,
    buyerName: string    // name of the buyer who made the offer
  ) {
    console.log(`🔔 Creating new deal notification for seller: ${sellerId}, from buyer: ${buyerId}`);
    return this.createNotification({
      user_id: sellerId,  // seller gets the notification
      type: 'new_deal',
      title: 'New Deal Created',
      message: `New deal from ${buyerName} for ${vehicleTitle}`,
      deal_id: dealId,
      related_user_id: buyerId,  // buyer is the related user
      metadata: { vehicleTitle, buyerName }
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
      'offer_rejected': 'Offer rejected',
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
