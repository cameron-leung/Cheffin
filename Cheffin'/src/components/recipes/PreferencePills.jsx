import React from 'react';
import { cn } from '@/lib/utils';

export const PREFERENCE_OPTIONS = [
  { key: 'indian',      label: 'Indian Cuisine', emoji: '🍛' },
  { key: 'meal_prep',   label: 'Meal Prep',      emoji: '📦' },
  { key: 'gluten_free', label: 'Gluten-Free',    emoji: '🌾' },
  { key: 'salad',       label: 'Salads',         emoji: '🥗' },
];

export default function PreferencePills({ preferences = [], onChange, size = 'md' }) {
  const toggle = (key) => {
    if (preferences.includes(key)) {
      onChange(preferences.filter(p => p !== key));
    } else {
      onChange([...preferences, key]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PREFERENCE_OPTIONS.map(({ key, label, emoji }) => {
        const active = preferences.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border font-medium transition-all',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm',
              active
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            )}
          >
            <span>{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}