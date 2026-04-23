import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WebRecipeCard from './WebRecipeCard';
import { PREFERENCE_OPTIONS } from './PreferencePills';

const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    title:        { type: 'string' },
    description:  { type: 'string' },
    author:       { type: 'string', description: 'Recipe author or contributor name' },
    cuisine:      { type: 'string' },
    time_of_day:  { type: 'string' },
    occasion:     { type: 'string' },
    dietary:      { type: 'array', items: { type: 'string' } },
    tags:         { type: 'array', items: { type: 'string' }, description: 'Descriptive tags like "comfort food", "weeknight", "summer", etc.' },
    prep_time:    { type: 'number', description: 'Prep time in minutes' },
    cook_time:    { type: 'number', description: 'Cook time in minutes' },
    servings:     { type: 'number' },
    web_rating:   { type: 'number', description: 'Site rating out of 5 (e.g. 4.7)' },
    review_count: { type: 'number', description: 'Number of user ratings/reviews on the site' },
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
    steps:       { type: 'array', items: { type: 'string' } },
    image_url:   { type: 'string', description: 'A real Unsplash photo URL matching the dish: https://images.unsplash.com/photo-XXXXX?w=800' },
    source_url:  { type: 'string', description: 'Direct URL to the recipe page on allrecipes.com, cooking.nytimes.com, or epicurious.com' },
    source_site: { type: 'string', description: 'One of: allrecipes, nytcooking, epicurious' },
  }
};

export default function RecommendedSection({ preferences, onSave }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Auto-fetch on mount
  useEffect(() => {
    fetchRecommended();
  }, []);

  const prefLabels = preferences
    .map(p => PREFERENCE_OPTIONS.find(o => o.key === p)?.label)
    .filter(Boolean);

  const fetchRecommended = async () => {
    setLoading(true);
    const prefStr = prefLabels.length
      ? `The user's flavor preferences are: ${prefLabels.join(', ')}.`
      : 'The user has no specific preferences — suggest the most popular trending recipes right now.';

    const prompt = `You are a recipe curator with access to the web. Search and scrape real recipes from AllRecipes (allrecipes.com), NYT Cooking (cooking.nytimes.com), and Epicurious (epicurious.com).

${prefStr}

Return 9 recipes — exactly 3 from each site. For EACH recipe provide ALL of the following fields:
- title: exact recipe name from the site
- description: a 1-2 sentence summary
- author: the recipe author or contributor's name as listed on the site
- cuisine: cuisine type (e.g. Italian, Mexican, Indian, American, etc.)
- time_of_day: one of Breakfast, Lunch, Dinner, Snack, Dessert, Brunch
- occasion: one of Everyday, Date Night, Party, Holiday, Quick Meal, Meal Prep, Special Occasion
- dietary: array of applicable tags like Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Paleo
- tags: 4-6 short descriptive tags (e.g. "comfort food", "weeknight dinner", "30 minutes", "crowd-pleaser")
- prep_time: prep time in minutes (number)
- cook_time: cook time in minutes (number)
- servings: number of servings
- web_rating: the actual star rating on the site out of 5 (e.g. 4.6)
- review_count: actual number of user reviews on the site (e.g. 2847)
- ingredients: full list, each with name, amount, unit
- steps: numbered step-by-step instructions
- image_url: a relevant Unsplash photo URL in format https://images.unsplash.com/photo-XXXXX?w=800
- source_url: the exact real URL to the recipe on the site
- source_site: one of "allrecipes", "nytcooking", "epicurious"

Make the recipes highly rated (4+ stars), diverse in cuisine, and tailored to the user's preferences.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          recipes: { type: 'array', items: RECIPE_SCHEMA }
        }
      }
    });

    setResults(result.recipes || []);
    setFetched(true);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Wand2 className="w-5 h-5 text-primary shrink-0" />
          <h2 className="font-heading text-xl font-semibold">Recommended For You</h2>
          {prefLabels.map(l => (
            <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{l}</span>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRecommended} disabled={loading} className="text-xs shrink-0">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span className="ml-1.5">{loading ? 'Loading...' : 'Refresh'}</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="text-sm">Searching AllRecipes, NYT Cooking & Epicurious…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((r, i) => (
            <WebRecipeCard key={i} recipe={r} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  );
}