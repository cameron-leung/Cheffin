import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2, Pencil, BookOpen, Heart } from 'lucide-react';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeDetail from '@/components/recipes/RecipeDetail';
import StarRating from '@/components/recipes/StarRating';
import PreferencePills from '@/components/recipes/PreferencePills';

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [preferences, setPreferences] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.RecipeRating.list('-created_date', 200),
  });

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setProfilePic(user.profile_picture || '');
      setPreferences(user.preferences || []);
    }
  }, [user]);

  const handlePreferenceChange = async (newPrefs) => {
    setPreferences(newPrefs);
    await base44.auth.updateMe({ preferences: newPrefs });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditing(false);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfilePic(file_url);
    await base44.auth.updateMe({ profile_picture: file_url });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setUploading(false);
  };

  // Get rated recipes with their ratings
  const ratedRecipes = ratings
    .filter(r => r.rating > 0)
    .map(r => ({
      rating: r,
      recipe: recipes.find(rec => rec.id === r.recipe_id),
    }))
    .filter(r => r.recipe);

  const myRecipes = recipes.filter(r => r.created_by === user?.email);

  const getRating = (recipeId) => {
    const r = ratings.find(rt => rt.recipe_id === recipeId);
    return r?.rating || 0;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-card rounded-2xl border border-border/50">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={profilePic} />
            <AvatarFallback className="text-2xl font-heading bg-primary/10 text-primary">
              {user?.full_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="font-heading text-2xl font-bold">{user?.full_name || 'Home Chef'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>

          {editing ? (
            <div className="space-y-3 pt-2">
              <Textarea
                placeholder="Write a little about yourself and your cooking style..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="resize-none h-20 text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveMutation.mutate({ bio })} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <p className="text-sm text-muted-foreground italic">
                {bio || 'No bio yet — tell us about your cooking style!'}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="mt-1 h-7 text-xs">
                <Pencil className="w-3 h-3 mr-1" /> Edit Bio
              </Button>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col gap-6 sm:gap-3 text-center">
          <div>
            <p className="text-2xl font-bold font-heading">{myRecipes.length}</p>
            <p className="text-xs text-muted-foreground">Recipes</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{ratedRecipes.length}</p>
            <p className="text-xs text-muted-foreground">Rated</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <section className="space-y-3 p-5 bg-card rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-lg font-semibold">Taste Preferences</h2>
        </div>
        <p className="text-xs text-muted-foreground">Select the flavors & styles you love — these shape your recipe recommendations on the home page.</p>
        <PreferencePills preferences={preferences} onChange={handlePreferenceChange} />
      </section>

      {/* Rated recipes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Rated Recipes</h2>
        </div>

        {ratedRecipes.length > 0 ? (
          <div className="space-y-3">
            {ratedRecipes.map(({ recipe, rating }) => (
              <button
                key={rating.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold truncate">{recipe.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{recipe.cuisine} · {recipe.time_of_day}</p>
                </div>
                <StarRating rating={rating.rating} size="sm" readonly />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm">No rated recipes yet. Open a recipe to rate it!</p>
          </div>
        )}
      </section>

      {/* My recipes */}
      {myRecipes.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">My Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRecipes.map(r => (
              <RecipeCard key={r.id} recipe={r} rating={getRating(r.id)} onClick={setSelectedRecipe} />
            ))}
          </div>
        </section>
      )}

      <RecipeDetail
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}