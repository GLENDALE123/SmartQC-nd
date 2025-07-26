import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-1">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            value === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          title={color}
        />
      ))}
    </div>
  );
} 