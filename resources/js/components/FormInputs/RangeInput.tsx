import React from 'react';

interface RangeInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

export default function RangeInput({
  label,
  name,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  required = false,
  disabled = false,
  showValue = true,
  className = '',
}: RangeInputProps) {
  const getValueLabel = (val: number, maxVal: number): string => {
    const percentage = (val / maxVal) * 100;
    if (percentage <= 33) return "Low";
    if (percentage <= 66) return "Medium";
    return "High";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showValue && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#102d4e] dark:text-[#4a7ba7]">
              {value}/{max}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#aaa]">
              {getValueLabel(value, max)}
            </span>
          </div>
        )}
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        required={required}
        className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#102d4e] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#333] dark:accent-[#4a7ba7]"
      />
      <div className="flex justify-between text-xs text-[#7a7a75] dark:text-[#a5a5a0]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
