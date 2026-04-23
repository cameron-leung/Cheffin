import React from 'react';
import { Clock, Users, Star, ExternalLink, ChefHat, BookmarkPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SOURCE_CONFIG = {
  allrecipes:  { label: 'AllRecipes',  bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  nytcooking:  { label: 'NYT Cooking', bg: 'bg-red-50 text-red-700 border-red-200' },
  epicurious:  { label: 'Epicurious',  bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function StarDisplay({ rating, reviewCount }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i <= full ? 'fill-amber-400 text-amber-400' :
              i === full + 1 && half ? 'fill-amber-200 text-amber-400' :
              'fill-transparent text-border'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground font-medium">{rating.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="text-xs text-muted-foreground">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}

export default function WebRecipeCard({ recipe, onSave }) {
  const src = SOURCE_CONFIG[recipe.source_site] || {};
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative bg-secondary shrink-0">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {/* Source badge */}
        {src.label && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${src.bg}`}>
            {src.label}
          </span>
        )}
        {/* External link */}
        {recipe.source_url && (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            title="View original recipe"
          >
            <ExternalLink className="w-3.5 h-3.5 text-foreground" />
          </a>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Title */}
        <h3 className="font-heading text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>

        {/* Author */}
        {recipe.author && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ChefHat className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">by {recipe.author}</span>
          </div>
        )}

        {/* Rating */}
        <StarDisplay rating={recipe.web_rating} reviewCount={recipe.review_count} />

        {/* Time + Servings */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {recipe.prep_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Prep {recipe.prep_time}m</span>
            </span>
          )}
          {recipe.cook_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              <span>Cook {recipe.cook_time}m</span>
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{recipe.servings} servings</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 4 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                +{recipe.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Ingredients preview */}
        {recipe.ingredients?.length > 0 && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground">{recipe.ingredients.length} ingredients: </span>
            {recipe.ingredients.slice(0, 5).map(i => i.name).join(', ')}
            {recipe.ingredients.length > 5 ? '…' : ''}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 mt-auto">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onSave(recipe)}
          >
            <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
            Save Recipe
          </Button>
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}