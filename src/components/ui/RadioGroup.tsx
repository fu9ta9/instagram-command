import React from 'react';
import { Controller, Control } from 'react-hook-form';

interface RadioOption {
  value: any;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  control: Control<any>;
  defaultValue?: any;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ 
  options, 
  name, 
  control,
  defaultValue 
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { onChange, value } }) => (
        <div className="flex space-x-4">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                name={name}
                className="h-4 w-4 accent-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    />
  );
};