import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", "American", "Korean", "Vietnamese", "Middle Eastern", "Greek", "Other"];
const TIME_OF_DAY = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"];
const OCCASIONS = ["Everyday", "Date Night", "Party", "Holiday", "Quick Meal", "Meal Prep", "Special Occasion"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Nut-Free", "Low-Carb"];

export default function FilterBar({ filters, onFilterChange }) {
  const hasFilters = Object.values(filters).some(v => v && v !== 'all');

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value === 'all' ? '' : value });
  };

  const clearAll = () => {
    onFilterChange({ cuisine: '', time_of_day: '', occasion: '', dietary: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={filters.time_of_day || 'all'} onValueChange={(v) => updateFilter('time_of_day', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Time of Day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Times</SelectItem>
            {TIME_OF_DAY.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.occasion || 'all'} onValueChange={(v) => updateFilter('occasion', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Occasions</SelectItem>
            {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.dietary || 'all'} onValueChange={(v) => updateFilter('dietary', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Dietary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diets</SelectItem>
            {DIETARY.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.cuisine || 'all'} onValueChange={(v) => updateFilter('cuisine', v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {CUISINES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-xs text-muted-foreground">
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}