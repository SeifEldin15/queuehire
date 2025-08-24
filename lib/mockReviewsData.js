// Mock data for testing the reviews system functionality
// This simulates what would be returned from the database

// Simulated user rating stats
export const mockRatingStats = {
  user_id: 'test-user-123',
  email: 'test@example.com', 
  full_name: 'Test User',
  average_rating: 4.2,
  total_reviews: 8,
  five_star_count: 3,
  four_star_count: 3,
  three_star_count: 2,
  two_star_count: 0,
  one_star_count: 0
};

// Simulated user reviews
export const mockReviews = [
  {
    id: '1',
    reviewer_id: 'reviewer-1',
    reviewed_user_id: 'test-user-123',
    rating: 5,
    review_text: 'Excellent professional! Great communication and delivered exactly what was promised.',
    meeting_context: 'Interview for Software Engineer position',
    created_at: '2024-01-15T10:30:00Z',
    reviewer: {
      id: 'reviewer-1',
      full_name: 'John Smith',
      email: 'john@company.com'
    }
  },
  {
    id: '2', 
    reviewer_id: 'reviewer-2',
    reviewed_user_id: 'test-user-123',
    rating: 4,
    review_text: 'Very knowledgeable and prepared. Would recommend.',
    meeting_context: 'Technical screening call',
    created_at: '2024-01-10T14:15:00Z',
    reviewer: {
      id: 'reviewer-2',
      full_name: 'Sarah Johnson',
      email: 'sarah@startup.io'
    }
  },
  {
    id: '3',
    reviewer_id: 'reviewer-3', 
    reviewed_user_id: 'test-user-123',
    rating: 4,
    review_text: 'Professional and punctual. Good technical skills.',
    meeting_context: 'Final round interview',
    created_at: '2024-01-05T09:00:00Z',
    reviewer: {
      id: 'reviewer-3',
      full_name: 'Mike Chen',
      email: 'mike@techcorp.com'
    }
  }
];

// Function to simulate DatabaseService.getUserRatingStats
export function getMockUserRatingStats(userId) {
  return Promise.resolve(mockRatingStats);
}

// Function to simulate DatabaseService.getUserReviews  
export function getMockUserReviews(userId) {
  return Promise.resolve(mockReviews);
}
