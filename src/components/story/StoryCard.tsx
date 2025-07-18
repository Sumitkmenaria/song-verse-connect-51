import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Clock, User, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Story } from "@/types/app";
import { formatDate } from "@/utils/formatters/date";

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-purple-600/30 text-purple-200 border-purple-500/50">
            {story.genre}
          </Badge>
          <div className="flex items-center text-white/60 text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {story.word_count || 0} words
          </div>
        </div>
        
        <Link to={`/story/${story.id}`} className="group-hover:text-purple-300 transition-colors">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {story.title}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={story.author_avatar} />
            <AvatarFallback className="bg-purple-600/50 text-white text-xs">
              {story.author_username?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
          <Link 
            to={`/profile/${story.author_id}`}
            className="text-sm text-white/80 hover:text-purple-300 transition-colors"
          >
            {story.author_username || "Anonymous"}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-white/70 text-sm leading-relaxed">
          {truncateContent(story.content)}
        </p>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-white/60">
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span className="text-sm">{story.average_rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{story.review_count}</span>
          </div>
        </div>
        
        <span className="text-xs text-white/50">
          {formatDate(story.created_at)}
        </span>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;