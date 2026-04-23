import React from 'react';
import { Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';

export default function RecipeCard({ recipe, rating, onClick }) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <button
      onClick={() => onClick?.(recipe)}
      className="group text-left w-full bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden relative bg-secondary">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        {recipe.cuisine && (
          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground text-xs border-0">
            {recipe.cuisine}
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-heading text-lg font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {totalTime}m
              </span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {recipe.servings}
              </span>
            )}
          </div>
          {rating > 0 && <StarRating rating={rating} size="sm" readonly />}
        </div>
      </div>
    </button>
  );
}