import React from 'react';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  className = '',
}: TextInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-md border border-[#ccc] bg-white px-3 py-2 text-[#1b1b18] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#444] dark:bg-[#1a1a1a] dark:text-[#EDEDEC] dark:focus:ring-[#4a7ba7]"
      />
    </div>
  );
}
