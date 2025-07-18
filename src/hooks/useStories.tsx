import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story, StoriesStats } from "@/types/app";

const ITEMS_PER_PAGE = 12;

export interface StoriesWithStatsRow {
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

export const useStories = (searchTerm: string = "", genreFilter: string = "All") => {
  return useInfiniteQuery({
    queryKey: ["stories", searchTerm, genreFilter],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`Fetching stories - page: ${pageParam}, search: ${searchTerm}, genre: ${genreFilter}`);
      
      try {
        let query = supabase
          .from("stories")
          .select(`
            *,
            profiles!stories_author_id_fkey(username, avatar_url)
          `)
          .eq('is_published', true)
          .order("created_at", { ascending: false })
          .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
        }

        if (genreFilter && genreFilter !== "All") {
          query = query.eq("genre", genreFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching stories:", error);
          throw error;
        }

        // Transform data to match Story interface
        const stories: Story[] = (data || []).map((story: any) => ({
          id: story.id,
          title: story.title,
          content: story.content,
          genre: story.genre,
          author_id: story.author_id,
          created_at: story.created_at,
          updated_at: story.updated_at,
          is_published: story.is_published,
          word_count: story.word_count,
          author_username: story.profiles?.username,
          author_avatar: story.profiles?.avatar_url,
          average_rating: 0, // TODO: Calculate from reviews
          review_count: 0, // TODO: Calculate from reviews
        }));

        return {
          data: stories,
          nextPage: stories.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        };
      } catch (error) {
        console.error("Error fetching stories:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};

export const useStoriesStats = () => {
  return useQuery({
    queryKey: ["stories-stats"],
    queryFn: async (): Promise<StoriesStats> => {
      try {
        const [storiesCount, authorsCount, reviewsCount] = await Promise.all([
          supabase.from("stories").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
        ]);

        const avgRatingResult = await supabase
          .from("reviews")
          .select("rating");

        const ratings = avgRatingResult.data?.map(r => r.rating) || [];
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;

        return {
          total_stories: storiesCount.count || 0,
          total_authors: authorsCount.count || 0,
          total_reviews: reviewsCount.count || 0,
          average_rating: Math.round(averageRating * 10) / 10,
        };
      } catch (error) {
        console.error("Error fetching stories stats:", error);
        throw error;
      }
    },
  });
};