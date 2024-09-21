import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name }) => {
  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            name={name}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};