import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical } from 'lucide-react';

export default function StepsInput({ steps, onChange }) {
  const addStep = () => onChange([...steps, '']);

  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    onChange(updated);
  };

  const removeStep = (index) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Steps</label>
        <Button type="button" variant="ghost" size="sm" onClick={addStep} className="text-xs h-7">
          <Plus className="w-3 h-3 mr-1" /> Add Step
        </Button>
      </div>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="shrink-0 w-7 h-7 mt-1.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
            {i + 1}
          </span>
          <Textarea
            placeholder={`Step ${i + 1}...`}
            value={step}
            onChange={(e) => updateStep(i, e.target.value)}
            className="flex-1 min-h-[60px] text-sm resize-none"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(i)} className="h-8 w-8 shrink-0 mt-1">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      {steps.length === 0 && (
        <button
          type="button"
          onClick={addStep}
          className="w-full py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm hover:border-primary/30 hover:text-primary transition-colors"
        >
          + Add your first step
        </button>
      )}
    </div>
  );
}