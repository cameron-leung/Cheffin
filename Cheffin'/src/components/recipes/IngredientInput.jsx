import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function IngredientInput({ ingredients, onChange }) {
  const addIngredient = () => {
    onChange([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeIngredient = (index) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Ingredients</label>
        <Button type="button" variant="ghost" size="sm" onClick={addIngredient} className="text-xs h-7">
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>
      {ingredients.map((ing, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            placeholder="Amount"
            value={ing.amount}
            onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
            className="w-20 h-9 text-sm"
          />
          <Input
            placeholder="Unit"
            value={ing.unit}
            onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
            className="w-20 h-9 text-sm"
          />
          <Input
            placeholder="Ingredient name"
            value={ing.name}
            onChange={(e) => updateIngredient(i, 'name', e.target.value)}
            className="flex-1 h-9 text-sm"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)} className="h-8 w-8 shrink-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {ingredients.length === 0 && (
        <button
          type="button"
          onClick={addIngredient}
          className="w-full py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm hover:border-primary/30 hover:text-primary transition-colors"
        >
          + Add your first ingredient
        </button>
      )}
    </div>
  );
}