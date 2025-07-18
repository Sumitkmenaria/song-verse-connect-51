// Shared application types
export interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  word_count: number;
  author_username?: string;
  author_avatar?: string;
  average_rating: number;
  review_count: number;
}

export interface StoriesStats {
  total_stories: number;
  total_authors: number;
  total_reviews: number;
  average_rating: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithStories extends Collection {
  stories: Array<{
    id: string;
    title: string;
    author: string;
    genre: string;
    word_count: number;
    position: number;
  }>;
}

export interface Review {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  reviewer_id: string;
  reviewer_username: string;
  reviewer_avatar?: string;
  story_id: string;
  story_title?: string;
  story_author?: string;
  upvote_count?: number;
  comment_count?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  username: string;
  stories_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  following_count: number;
  followers_count: number;
}

export interface SubmittedStory {
  id: string;
  title: string;
  author: string;
  genre: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  word_count: number;
}

export interface UserReview {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  story: {
    id: string;
    title: string;
    author: string;
    genre: string;
  };
}

export interface TopContributor {
  id: string;
  username: string;
  stories_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  total_contributions: number;
  avatar_url?: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar_url?: string;
}

// Define allowed genre values for stories
export type StoryGenre = 'fiction' | 'non_fiction' | 'fantasy' | 'science_fiction' | 'mystery' | 'thriller' | 'romance' | 'horror' | 'adventure' | 'drama' | 'comedy' | 'historical' | 'biography' | 'poetry' | 'short_story' | 'novel' | 'novella' | 'memoir' | 'essay' | 'other';