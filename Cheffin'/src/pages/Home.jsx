import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipes/RecipeCard';
import FilterBar from '@/components/recipes/FilterBar';
import RecipeDetail from '@/components/recipes/RecipeDetail';
import PreferencePills from '@/components/recipes/PreferencePills';
import RecommendedSection from '@/components/recipes/RecommendedSection';

export default function Home() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ cuisine: '', time_of_day: '', occasion: '', dietary: '' });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [webResults, setWebResults] = useState([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [preferences, setPreferences] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.RecipeRating.list('-created_date', 200),
  });

  useEffect(() => {
    if (user?.preferences) setPreferences(user.preferences);
  }, [user]);

  const handlePreferenceChange = async (newPrefs) => {
    setPreferences(newPrefs);
    await base44.auth.updateMe({ preferences: newPrefs });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const getRating = (recipeId) => {
    const recipeRatings = ratings.filter(r => r.recipe_id === recipeId);
    if (recipeRatings.length === 0) return 0;
    return Math.round(recipeRatings.reduce((s, r) => s + r.rating, 0) / recipeRatings.length);
  };

  const filteredRecipes = recipes.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesText = r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.ingredients?.some(i => i.name?.toLowerCase().includes(q));
      if (!matchesText) return false;
    }
    if (filters.cuisine && r.cuisine !== filters.cuisine) return false;
    if (filters.time_of_day && r.time_of_day !== filters.time_of_day) return false;
    if (filters.occasion && r.occasion !== filters.occasion) return false;
    if (filters.dietary && !r.dietary?.includes(filters.dietary)) return false;
    return true;
  });

  const searchWeb = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingWeb(true);
    const prefContext = preferences.length
      ? ` The user prefers: ${preferences.join(', ')}.`
      : '';
    const prompt = `Search the internet for "${searchQuery}" recipes.${prefContext} ${filters.cuisine ? `Cuisine: ${filters.cuisine}.` : ''} ${filters.time_of_day ? `Meal time: ${filters.time_of_day}.` : ''} ${filters.dietary ? `Dietary: ${filters.dietary}.` : ''} Return 6 recipe suggestions with full details including ingredients, steps, a real Unsplash image URL, and source URL.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          recipes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title:       { type: 'string' },
                description: { type: 'string' },
                cuisine:     { type: 'string' },
                time_of_day: { type: 'string' },
                prep_time:   { type: 'number' },
                cook_time:   { type: 'number' },
                servings:    { type: 'number' },
                ingredients: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name:   { type: 'string' },
                      amount: { type: 'string' },
                      unit:   { type: 'string' }
                    }
                  }
                },
                steps:      { type: 'array', items: { type: 'string' } },
                image_url:  { type: 'string' },
                source_url: { type: 'string' }
              }
            }
          }
        }
      }
    });
    setWebResults(result.recipes || []);
    setIsSearchingWeb(false);
  };

  const saveWebRecipe = async (webRecipe) => {
    const saved = await base44.entities.Recipe.create({ ...webRecipe, source: 'web' });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    setSelectedRecipe(saved);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
          What are you <span className="text-primary italic">cooking</span> today?
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Discover recipes from your collection or search the web for inspiration.
        </p>
      </div>

      {/* Preferences */}
      <div className="max-w-2xl mx-auto space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Tastes</p>
        <PreferencePills preferences={preferences} onChange={handlePreferenceChange} />
        {preferences.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Saved · influences your recommendations below
          </p>
        )}
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipe name, ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchWeb()}
              className="pl-10 h-12 bg-card text-base"
            />
          </div>
          <Button onClick={searchWeb} disabled={isSearchingWeb} className="h-12 px-5">
            {isSearchingWeb
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Sparkles className="w-4 h-4 mr-2" />Discover</>
            }
          </Button>
        </div>
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Web search results */}
      {webResults.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">Discovered from the Web</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {webResults.map((r, i) => (
              <RecipeCard key={i} recipe={r} onClick={() => saveWebRecipe(r)} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended section — preference-driven, multi-source scrape */}
      <RecommendedSection preferences={preferences} onSave={saveWebRecipe} />

      {/* My saved recipes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Your Recipes</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(r => (
              <RecipeCard key={r.id} recipe={r} rating={getRating(r.id)} onClick={setSelectedRecipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">No recipes yet</p>
            <p className="text-sm">Add your first recipe or search the web for inspiration!</p>
          </div>
        )}
      </section>

      <RecipeDetail
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}