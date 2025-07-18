import { InfiniteData } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Story } from "@/types/app";
import StoryCard from "@/components/story/StoryCard";

interface StoriesGridProps {
  data: InfiniteData<{ data: Story[]; nextPage?: number }> | undefined;
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const StoriesGrid = ({ 
  data, 
  isLoading, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage 
}: StoriesGridProps) => {
  const stories = data?.pages?.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">No stories found</h3>
        <p className="text-white/60">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More Stories"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoriesGrid;