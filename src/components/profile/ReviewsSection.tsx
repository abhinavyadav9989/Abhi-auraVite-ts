import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  Flag, 
  Reply,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

export default function ReviewsSection({ 
  reviews = [], 
  dealer, 
  userRole, 
  canEdit, 
  onReviewUpdate 
}) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = async (reviewId) => {
    // Mock reply functionality
    console.log('Reply to review:', reviewId, replyText);
    setReplyingTo(null);
    setReplyText('');
    if (onReviewUpdate) {
      onReviewUpdate(dealer?.id);
    }
  };

  const handleFlag = async (reviewId) => {
    // Mock flag functionality
    console.log('Flag review:', reviewId);
    if (onReviewUpdate) {
      onReviewUpdate(dealer?.id);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-slate-300'
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {String(getAverageRating())}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(parseFloat(String(getAverageRating()))))}
              </div>
              <p className="text-slate-600">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-6">{rating}★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: reviews.length > 0 
                          ? `${(ratingDistribution[rating] / reviews.length) * 100}%` 
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-8">
                    {ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.reviewer_name?.[0]?.toUpperCase() || 'R'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.reviewer_name || 'Anonymous'}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.rating || 0)}
                          </div>
                          <span className="text-sm text-slate-500">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {canEdit && !review.dealer_response && (
                          <DropdownMenuItem 
                            onClick={() => setReplyingTo(review.id)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleFlag(review.id)}
                          className="text-red-600"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Flag as inappropriate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-slate-700 mb-3">{review.review_text}</p>

                  {review.is_verified && (
                    <Badge variant="secondary" className="mb-3">
                      Verified Purchase
                    </Badge>
                  )}

                  {/* Dealer Response */}
                  {review.dealer_response && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {dealer?.business_name?.[0]?.toUpperCase() || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-blue-900">
                          {dealer?.business_name} (Owner)
                        </span>
                        <span className="text-xs text-blue-600">
                          {format(new Date(review.responded_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">{review.dealer_response}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(review.id)}>
                          Post Reply
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
              <p className="text-slate-600">
                Reviews from other dealers will appear here after completed transactions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}