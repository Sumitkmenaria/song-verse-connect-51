import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collection, CollectionWithStories } from "@/types/app";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const useCollections = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["collections", user?.id],
    queryFn: async (): Promise<Collection[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const usePublicCollections = () => {
  return useQuery({
    queryKey: ["public-collections"],
    queryFn: async (): Promise<Collection[]> => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCollectionWithStories = (collectionId: string) => {
  return useQuery({
    queryKey: ["collection-with-stories", collectionId],
    queryFn: async (): Promise<CollectionWithStories | null> => {
      const { data: collection, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (collectionError) throw collectionError;
      if (!collection) return null;

      const { data: collectionStories, error: storiesError } = await supabase
        .from("collection_stories")
        .select(`
          position,
          stories(
            id,
            title,
            genre,
            word_count,
            profiles!stories_author_id_fkey(username)
          )
        `)
        .eq("collection_id", collectionId)
        .order("position");

      if (storiesError) throw storiesError;

      const stories = (collectionStories || []).map((cs: any) => ({
        id: cs.stories.id,
        title: cs.stories.title,
        author: cs.stories.profiles?.username || "Unknown",
        genre: cs.stories.genre,
        word_count: cs.stories.word_count,
        position: cs.position,
      }));

      return {
        ...collection,
        stories,
      };
    },
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (collectionData: {
      name: string;
      description?: string;
      is_public?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          ...collectionData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Collection created",
        description: "Your collection has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating collection:", error);
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      // First delete all collection_stories relationships
      await supabase
        .from("collection_stories")
        .delete()
        .eq("collection_id", collectionId);

      // Then delete the collection
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting collection:", error);
    },
  });
};

export const useAddStoryToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collectionId,
      storyId,
    }: {
      collectionId: string;
      storyId: string;
    }) => {
      // Get the next position
      const { data: lastPosition } = await supabase
        .from("collection_stories")
        .select("position")
        .eq("collection_id", collectionId)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = (lastPosition?.position || 0) + 1;

      const { error } = await supabase
        .from("collection_stories")
        .insert({
          collection_id: collectionId,
          story_id: storyId,
          position,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-with-stories"] });
      toast({
        title: "Story added",
        description: "Story has been added to your collection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add story to collection. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding story to collection:", error);
    },
  });
};