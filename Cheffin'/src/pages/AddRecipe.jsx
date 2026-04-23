import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, ChefHat } from 'lucide-react';
import IngredientInput from '@/components/recipes/IngredientInput';
import StepsInput from '@/components/recipes/StepsInput';

const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", "American", "Korean", "Vietnamese", "Middle Eastern", "Greek", "Other"];
const TIME_OF_DAY = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"];
const OCCASIONS = ["Everyday", "Date Night", "Party", "Holiday", "Quick Meal", "Meal Prep", "Special Occasion"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Nut-Free", "Low-Carb"];

export default function AddRecipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', image_url: '', cuisine: '', time_of_day: '',
    occasion: '', dietary: [], prep_time: '', cook_time: '', servings: '',
    ingredients: [], steps: [], source: 'manual',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('image_url', file_url);
    setUploadingImage(false);
  };

  const toggleDietary = (value) => {
    const current = form.dietary || [];
    if (current.includes(value)) {
      update('dietary', current.filter(d => d !== value));
    } else {
      update('dietary', [...current, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Recipe.create({
      ...form,
      prep_time: form.prep_time ? Number(form.prep_time) : undefined,
      cook_time: form.cook_time ? Number(form.cook_time) : undefined,
      servings: form.servings ? Number(form.servings) : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    setSaving(false);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">Add Recipe</h1>
          <p className="text-sm text-muted-foreground">Share your culinary creation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div>
          <label className="text-sm font-medium mb-2 block">Photo</label>
          {form.image_url ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
              <img src={form.image_url} alt="Recipe" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3"
                onClick={() => update('image_url', '')}
              >
                Change
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed bg-card cursor-pointer hover:border-primary/40 transition-colors">
              {uploadingImage ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload a photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Basic info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title *</label>
            <Input
              placeholder="e.g. Grandma's Tomato Soup"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <Textarea
              placeholder="A short description of your recipe..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Prep Time (min)</label>
            <Input type="number" placeholder="15" value={form.prep_time} onChange={(e) => update('prep_time', e.target.value)} className="h-10" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Cook Time (min)</label>
            <Input type="number" placeholder="30" value={form.cook_time} onChange={(e) => update('cook_time', e.target.value)} className="h-10" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Servings</label>
            <Input type="number" placeholder="4" value={form.servings} onChange={(e) => update('servings', e.target.value)} className="h-10" />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Cuisine</label>
            <Select value={form.cuisine || undefined} onValueChange={(v) => update('cuisine', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {CUISINES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Time of Day</label>
            <Select value={form.time_of_day || undefined} onValueChange={(v) => update('time_of_day', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {TIME_OF_DAY.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Occasion</label>
            <Select value={form.occasion || undefined} onValueChange={(v) => update('occasion', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dietary */}
        <div>
          <label className="text-sm font-medium mb-2 block">Dietary</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDietary(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.dietary?.includes(d)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <Separator />
        <IngredientInput ingredients={form.ingredients} onChange={(v) => update('ingredients', v)} />

        <Separator />
        <StepsInput steps={form.steps} onChange={(v) => update('steps', v)} />

        <div className="pt-4">
          <Button type="submit" disabled={saving || !form.title} className="w-full h-12 text-base">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Recipe
          </Button>
        </div>
      </form>
    </div>
  );
}