import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ExternalLink } from 'lucide-react';
import StarRating from './StarRating';

export default function RecipeDetail({ recipe, open, onClose }) {
  const queryClient = useQueryClient();

  const { data: ratings = [] } = useQuery({
    queryKey: ['my-rating', recipe?.id],
    queryFn: () => base44.entities.RecipeRating.filter({ recipe_id: recipe.id }),
    enabled: !!recipe?.id,
  });

  const myRating = ratings[0];

  const rateMutation = useMutation({
    mutationFn: async (value) => {
      if (myRating) {
        return base44.entities.RecipeRating.update(myRating.id, { rating: value });
      }
      return base44.entities.RecipeRating.create({ recipe_id: recipe.id, rating: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rating', recipe?.id] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });

  if (!recipe) return null;

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {recipe.image_url && (
          <div className="aspect-video overflow-hidden">
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{recipe.title}</DialogTitle>
            {recipe.description && (
              <p className="text-muted-foreground mt-1">{recipe.description}</p>
            )}
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-3">
            {totalTime > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" /> {totalTime} min
              </Badge>
            )}
            {recipe.servings > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" /> {recipe.servings} servings
              </Badge>
            )}
            {recipe.cuisine && <Badge variant="outline">{recipe.cuisine}</Badge>}
            {recipe.time_of_day && <Badge variant="outline">{recipe.time_of_day}</Badge>}
            {recipe.dietary?.map(d => (
              <Badge key={d} className="bg-accent/10 text-accent border-accent/20">{d}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Your Rating:</span>
            <StarRating rating={myRating?.rating || 0} onRate={(v) => rateMutation.mutate(v)} />
          </div>

          {recipe.ingredients?.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-heading text-lg font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>
                        {ing.amount && <span className="font-medium">{ing.amount} </span>}
                        {ing.unit && <span className="text-muted-foreground">{ing.unit} </span>}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {recipe.steps?.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-heading text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-4">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                        {i + 1}
                      </span>
                      <p className="pt-1 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {recipe.source_url && (
            <>
              <Separator />
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View original recipe
              </a>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}