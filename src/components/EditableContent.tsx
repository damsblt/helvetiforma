'use client';

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { contentService } from '@/services/contentService';

interface EditableContentProps {
  fieldName: string;
  value: string;
  type?: 'text' | 'textarea' | 'html';
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  onSave?: (value: string) => void;
  editTextColor?: string;
  editBackgroundColor?: string;
}

export default function EditableContent({
  fieldName,
  value,
  type = 'text',
  placeholder,
  className = '',
  children,
  onSave,
  editTextColor,
  editBackgroundColor
}: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is admin
  const isAdmin = authService.isAuthenticated() && authService.getUser()?.isAdmin;

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Update the content service
      (contentService as any).updateField(fieldName, editValue);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('contentUpdated'));
      
      // Call custom onSave if provided
      if (onSave) {
        onSave(editValue);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  // If not admin, just render the content normally
  if (!isAdmin) {
    return <div className={className}>{children}</div>;
  }

  // If editing, show edit form
  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        {type === 'textarea' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editTextColor || 'text-black'} ${editBackgroundColor || 'bg-white'}`}
          />
        ) : type === 'html' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            rows={6}
            className={`w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${editTextColor || 'text-black'} ${editBackgroundColor || 'bg-white'}`}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editTextColor || 'text-black'} ${editBackgroundColor || 'bg-white'}`}
          />
        )}
        
        {/* Edit buttons */}
        <div className="absolute -top-2 -right-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
            title="Sauvegarder"
          >
            {isSaving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Annuler"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        

      </div>
    );
  }

  // If admin but not editing, show content with edit button
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Edit button (pencil) */}
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all opacity-100 shadow-lg"
        title="Modifier"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}
