import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
}: SelectInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="w-full rounded-md border border-[#ccc] bg-white px-3 py-2 text-[#1b1b18] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#444] dark:bg-[#1a1a1a] dark:text-[#EDEDEC] dark:focus:ring-[#4a7ba7]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
