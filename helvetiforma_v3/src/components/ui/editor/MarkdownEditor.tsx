'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
  placeholder?: string
  autoSave?: boolean
  className?: string
}

export default function MarkdownEditor({
  content,
  onChange,
  onSave,
  placeholder = 'Commencez à écrire...',
  autoSave = true,
  className = '',
}: MarkdownEditorProps) {
  const [localContent, setLocalContent] = useState(content)
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || localContent === content) return

    const timeoutId = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save après 2 secondes d'inactivité

    return () => clearTimeout(timeoutId)
  }, [localContent, autoSave])

  const handleSave = useCallback(async () => {
    if (localContent === content) return

    setIsSaving(true)
    try {
      onChange(localContent)
      if (onSave) {
        await onSave()
      }
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }, [localContent, content, onChange, onSave])

  const handleContentChange = (value: string) => {
    setLocalContent(value)
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = localContent.substring(start, end)
    const newContent = 
      localContent.substring(0, start) + 
      before + selectedText + after + 
      localContent.substring(end)

    setLocalContent(newContent)
    
    // Restaurer la sélection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const toolbarButtons = [
    { icon: '**B**', action: () => insertMarkdown('**', '**'), title: 'Gras' },
    { icon: '*I*', action: () => insertMarkdown('*', '*'), title: 'Italique' },
    { icon: 'H1', action: () => insertMarkdown('# '), title: 'Titre 1' },
    { icon: 'H2', action: () => insertMarkdown('## '), title: 'Titre 2' },
    { icon: 'H3', action: () => insertMarkdown('### '), title: 'Titre 3' },
    { icon: '• List', action: () => insertMarkdown('- '), title: 'Liste' },
    { icon: '1. List', action: () => insertMarkdown('1. '), title: 'Liste numérotée' },
    { icon: '🔗', action: () => insertMarkdown('[', '](url)'), title: 'Lien' },
    { icon: '🖼️', action: () => insertMarkdown('![alt](', ')'), title: 'Image' },
    { icon: '`code`', action: () => insertMarkdown('`', '`'), title: 'Code inline' },
    { icon: '```', action: () => insertMarkdown('```\n', '\n```'), title: 'Bloc de code' },
    { icon: '> Quote', action: () => insertMarkdown('> '), title: 'Citation' },
  ]

  const renderPreview = (markdown: string) => {
    // Conversion Markdown basique pour la prévisualisation
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className={`bg-background border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              title={button.title}
              className="px-2 py-1 text-xs font-mono bg-background hover:bg-muted border border-border rounded transition-colors"
            >
              {button.icon}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isPreview 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background hover:bg-muted border border-border'
            }`}
          >
            {isPreview ? '📝 Éditer' : '👁️ Prévisualiser'}
          </button>

          {/* Save Status */}
          <div className="text-xs text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <div className="spinner w-3 h-3" />
                Sauvegarde...
              </span>
            ) : lastSaved ? (
              `Sauvé à ${lastSaved.toLocaleTimeString()}`
            ) : (
              'Non sauvegardé'
            )}
          </div>

          {/* Manual Save */}
          <button
            onClick={handleSave}
            disabled={isSaving || localContent === content}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreview ? (
          /* Preview Mode */
          <div className="p-6 min-h-96 prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: renderPreview(localContent)
              }}
            />
          </div>
        ) : (
          /* Editor Mode */
          <div className="relative">
            <textarea
              id="markdown-editor"
              value={localContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-96 p-6 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
            
            {/* Line Numbers (optionnel) */}
            <div className="absolute left-2 top-6 text-xs text-muted-foreground/50 font-mono pointer-events-none">
              {localContent.split('\n').map((_, index) => (
                <div key={index} className="leading-relaxed">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with shortcuts */}
      <div className="px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            Raccourcis: Ctrl+B (gras), Ctrl+I (italique), Ctrl+S (sauvegarder)
          </span>
          <span>
            {localContent.length} caractères, {localContent.split('\n').length} lignes
          </span>
        </div>
      </div>
    </div>
  )
}
