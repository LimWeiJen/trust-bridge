"use client";

import { Button } from "./ui/button";
import { X } from "lucide-react";

interface KeypadProps {
  value: string;
  onChange: (value: string) => void;
}

export const Keypad = ({ value, onChange }: KeypadProps) => {
  const handleKeyPress = (key: string) => {
    if (value.length < 6) {
      onChange(value + key);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
      {keys.map((key) => (
        <Button
          key={key}
          onClick={() => handleKeyPress(key)}
          variant="outline"
          className="h-14 sm:h-16 text-xl sm:text-2xl font-bold"
          aria-label={`Number ${key}`}
        >
          {key}
        </Button>
      ))}
      <Button
        onClick={handleClear}
        variant="ghost"
        className="h-14 sm:h-16 text-sm"
        disabled={value.length === 0}
        aria-label="Clear all digits"
      >
        Clear
      </Button>
      <Button
        onClick={() => handleKeyPress('0')}
        variant="outline"
        className="h-14 sm:h-16 text-xl sm:text-2xl font-bold"
        aria-label="Number 0"
      >
        0
      </Button>
      <Button
        onClick={handleDelete}
        variant="ghost"
        className="h-14 sm:h-16"
        disabled={value.length === 0}
        aria-label="Delete last digit"
      >
        <X className="h-6 w-6 sm:h-8 sm:w-8" />
      </Button>
    </div>
  );
};
