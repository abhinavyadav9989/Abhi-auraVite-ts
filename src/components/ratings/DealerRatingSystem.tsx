import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MessageCircle, 
  User, 
  Calendar,
  CheckCircle,
  Flag
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const RATING_CATEGORIES = [
  { id: 'communication', label: 'Communication', description: 'Response time and clarity' },
  { id: 'vehicle_condition', label: 'Vehicle Condition', description: 'Accuracy of listing vs actual' },
  { id: 'professionalism', label: 'Professionalism', description: 'Business conduct and ethics' },
  { id: 'transaction', label: 'Transaction', description: 'Smooth deal completion' }
];

export default function DealerRatingSystem({ 
  dealerId, 
  dealerName,
  transactionId,
  userRole, // 'buyer' or 'seller'
  onSubmitRating,
  existingRating = null,
  showReviews = true 
}) {
  const [ratings, setRatings] = useState(
    existingRating?.ratings || RATING_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {})
  );
  const [overallRating, setOverallRating] = useState(existingRating?.overall || 0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Mock review data - in real app would fetch from database
  const [reviews] = useState([
    {
      id: 1,
      reviewer_name: 'Mumbai Auto Hub',
      role: 'buyer',
      overall_rating: 4.5,
      ratings: {
        communication: 5,
        vehicle_condition: 4,
        professionalism: 5,
        transaction: 4
      },
      review: 'Excellent dealer to work with. Vehicle was exactly as described and the transaction was smooth. Highly recommended!',
      transaction_date: '2024-01-15T10:30:00Z',
      verified: true
    },
    {
      id: 2,
      reviewer_name: 'Delhi Car Point',
      role: 'seller',
      overall_rating: 4.2,
      ratings: {
        communication: 4,
        vehicle_condition: 4,
        professionalism: 5,
        transaction: 4
      },
      review: 'Good experience selling to them. Quick payment and professional handling.',
      transaction_date: '2024-01-10T14:20:00Z',
      verified: true
    },
    {
      id: 3,
      reviewer_name: 'Bangalore Motors',
      role: 'buyer',
      overall_rating: 3.8,
      ratings: {
        communication: 3,
        vehicle_condition: 4,
        professionalism: 4,
        transaction: 4
      },
      review: 'Vehicle was good but communication could be better. Deal took longer than expected.',
      transaction_date: '2024-01-05T09:15:00Z',
      verified: true
    }
  ]);

  const setCategoryRating = (categoryId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryId]: rating
    }));
    
    // Update overall rating (average of all categories)
    const newRatings: Record<string, number> = { ...ratings, [categoryId]: rating } as Record<string, number>;
    const average = (Object.values(newRatings) as number[]).reduce((sum, r) => sum + r, 0) / RATING_CATEGORIES.length;
    setOverallRating(Math.round(average * 2) / 2); // Round to nearest 0.5
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const ratingData = {
        dealer_id: dealerId,
        transaction_id: transactionId,
        reviewer_role: userRole,
        overall_rating: overallRating,
        category_ratings: ratings,
        review_text: review.trim(),
        verified: true // Mark as verified since it's from actual transaction
      };
      
      await onSubmitRating(ratingData);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
    
    setIsSubmitting(false);
  };

  const canSubmit = overallRating > 0 && (Object.values(ratings) as number[]).every((r) => r > 0);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.overall_rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  const RatingStars = ({ rating, onRate, size = 'default' }: { rating: any; onRate?: (v: number) => void; size?: 'default' | 'large' | 'small' }) => {
    const starSize = size === 'large' ? 'w-8 h-8' : size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            className={`${starSize} transition-colors ${
              star <= rating 
                ? 'text-yellow-500 fill-current' 
                : 'text-slate-300 hover:text-yellow-400'
            }`}
            disabled={!onRate}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Form */}
      {!existingRating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rate Your Experience with {dealerName}
            </CardTitle>
            <p className="text-sm text-slate-600">
              Your feedback helps build trust in the Aura community
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div className="text-center space-y-3">
              <h3 className="font-medium">Overall Rating</h3>
              <div className="flex items-center justify-center gap-2">
                <RatingStars 
                  rating={overallRating} 
                  onRate={setOverallRating}
                  size="large"
                />
                <span className="text-2xl font-bold text-slate-900 ml-2">
                  {overallRating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4">
              <h3 className="font-medium">Rate by Category</h3>
              {RATING_CATEGORIES.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{category.label}</h4>
                      <p className="text-xs text-slate-600">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars 
                        rating={ratings[category.id]} 
                        onRate={(rating) => setCategoryRating(category.id, rating)}
                      />
                      <span className="text-sm font-medium w-8">
                        {ratings[category.id] || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="font-medium text-sm">
                Written Review (Optional)
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with other dealers..."
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Help others make informed decisions</span>
                <span>{review.length}/500</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews Display */}
      {showReviews && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Reviews & Ratings
              </CardTitle>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-bold">{averageRating}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {reviews.length} review{reviews.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No reviews yet</p>
                <p className="text-sm text-slate-400">Be the first to leave a review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(reviewData => (
                  <div key={reviewData.id} className="border-b border-slate-100 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      {/* Reviewer Avatar */}
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>

                      <div className="flex-1">
                        {/* Review Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{reviewData.reviewer_name}</h4>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {reviewData.role}
                          </Badge>
                          {reviewData.verified && (
                            <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <RatingStars rating={reviewData.overall_rating} onRate={() => {}} size="small" />
                          <span className="text-sm font-medium">
                            {reviewData.overall_rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(reviewData.transaction_date), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-sm text-slate-700 mb-3">
                          {reviewData.review}
                        </p>

                        {/* Category Breakdown */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {RATING_CATEGORIES.map(category => (
                            <div key={category.id} className="flex justify-between">
                              <span className="text-slate-600">{category.label}:</span>
                              <div className="flex items-center gap-1">
                                <RatingStars 
                                  rating={reviewData.ratings[category.id]} 
                                  onRate={() => {}}
                                  size="small" 
                                />
                                <span className="font-medium">
                                  {reviewData.ratings[category.id]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Report Button */}
                      <Button variant="ghost" size="icon" className="w-6 h-6">
                        <Flag className="w-3 h-3 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}