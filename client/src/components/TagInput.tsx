/**
 * TagInput Component
 * Provides tag input functionality with add/remove capabilities
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = "Add tags...",
  disabled = false,
  maxTags = 10,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateTag = (tag: string): { isValid: boolean; error?: string } => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) {
      return { isValid: false, error: 'Tag cannot be empty' };
    }

    if (trimmedTag.length > 50) { // Check trimmed length for actual tag length
      return { isValid: false, error: 'Tag cannot exceed 50 characters' };
    }

    // Check for duplicate tags (case-insensitive)
    const existingTagsLowerCase = tags.map(existingTag => existingTag.toLowerCase());
    if (existingTagsLowerCase.includes(trimmedTag.toLowerCase())) {
      return { isValid: false, error: 'Tag already exists' };
    }

    return { isValid: true };
  };

  const addTag = (tagToAdd: string) => {
    const validation = validateTag(tagToAdd);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid tag');
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    const newTags = [...tags, tagToAdd.trim()];
    onChange(newTags);
    setInputValue('');
    setError(null);
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
    setError(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (inputValue) { // Check inputValue directly, not trimmed
        addTag(inputValue);
      }
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const handleAddButtonClick = () => {
    if (inputValue) { // Check inputValue directly, not trimmed
      addTag(inputValue);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start gap-2">
        <div className={`flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 border-2 rounded-md bg-white flex-1 cursor-text transition-colors duration-200 ${
          disabled ? 'bg-slate-50 border-slate-200' : 'border-slate-300 focus-within:border-blue-500'
        }`}>
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-2xl text-sm font-medium max-w-48">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {tag}
              </span>
              <button
                type="button"
                className={`bg-none border-none text-blue-700 cursor-pointer text-lg font-bold ml-1.5 p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors duration-200 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-200'
                }`}
                onClick={() => removeTag(index)}
                disabled={disabled}
                aria-label={`Remove tag: ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="border-none outline-none bg-transparent text-base py-1 min-w-30 flex-1 disabled:cursor-not-allowed"
            disabled={disabled}
          />
        </div>
        {inputValue && (
          <button
            type="button"
            className={`bg-blue-600 text-white border-none rounded px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 whitespace-nowrap ${
              disabled ? 'bg-slate-400 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            onClick={handleAddButtonClick}
            disabled={disabled}
            aria-label="Add tag"
          >
            Add
          </button>
        )}
      </div>
      {error && (
        <div className="text-red-600 text-sm mt-1 font-medium" role="alert">
          {error}
        </div>
      )}
      <div className="text-slate-500 text-xs mt-1 leading-snug">
        Press Enter or comma to add tags. {tags.length}/{maxTags} tags used.
      </div>
    </div>
  );
};

