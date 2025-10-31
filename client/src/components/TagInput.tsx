/**
 * TagInput Component
 * Provides tag input functionality with add/remove capabilities
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import React, { useState, KeyboardEvent } from 'react';
import './TagInput.css';

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
    const existingTags = tags.map(t => t.toLowerCase());
    if (existingTags.includes(trimmedTag.toLowerCase())) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue) { // Check inputValue directly, not trimmed
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const handleAddClick = () => {
    if (inputValue) { // Check inputValue directly, not trimmed
      addTag(inputValue);
    }
  };

  return (
    <div className={`tag-input ${className}`}>
      <div className="tag-input__container">
        <div className="tag-input__tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag-input__tag">
              <span className="tag-input__tag-text">{tag}</span>
              <button
                type="button"
                className="tag-input__tag-remove"
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
            className="tag-input__input"
            disabled={disabled}
          />
        </div>
        {inputValue && (
          <button
            type="button"
            className="tag-input__add-button"
            onClick={handleAddClick}
            disabled={disabled}
            aria-label="Add tag"
          >
            Add
          </button>
        )}
      </div>
      {error && (
        <div className="tag-input__error" role="alert">
          {error}
        </div>
      )}
      <div className="tag-input__help">
        Press Enter or comma to add tags. {tags.length}/{maxTags} tags used.
      </div>
    </div>
  );
};

