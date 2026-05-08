'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import type { ParsedRecipe } from '@/lib/types'

interface RecipeInputProps {
  onRecipeParsed: (recipe: ParsedRecipe, url: string) => void
  onManualAdd: (title: string) => void
  checkDuplicate?: (url: string) => boolean
  onDuplicateFound?: (url: string) => void
}

export function RecipeInput({
  onRecipeParsed,
  onManualAdd,
  checkDuplicate,
  onDuplicateFound,
}: RecipeInputProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return

    // If no URL, go directly to manual add
    if (!url.trim()) {
      onManualAdd(title.trim())
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    // Check for duplicates
    if (checkDuplicate && checkDuplicate(url)) {
      if (onDuplicateFound) {
        onDuplicateFound(url)
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Fall back to manual with pre-filled title
        onManualAdd(title.trim())
        return
      }

      // Use parsed data but override title if user provided one
      const parsedRecipe: ParsedRecipe = {
        title: title.trim() || data.title,
        ingredients: data.ingredients || [],
        steps: data.steps || [],
      }

      if (parsedRecipe.ingredients.length === 0 && parsedRecipe.steps.length === 0) {
        // Couldn't extract, go to manual with pre-filled title
        onManualAdd(title.trim())
        return
      }

      onRecipeParsed(parsedRecipe, url)
      setTitle('')
      setUrl('')
    } catch {
      // Network error, fall back to manual
      onManualAdd(title.trim())
    } finally {
      setIsLoading(false)
    }
  }, [title, url, onRecipeParsed, onManualAdd, checkDuplicate, onDuplicateFound])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && title.trim()) {
      handleSubmit()
    }
  }

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-semibold text-foreground">Add a Recipe</h2>
      
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="recipe-title">
            {"What's cookin'?"} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            ref={titleInputRef}
            id="recipe-title"
            type="text"
            placeholder="Enter recipe name"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            className="h-11"
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="recipe-url">Recipe URL (optional)</FieldLabel>
          <Input
            id="recipe-url"
            type="url"
            placeholder="https://example.com/recipe"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            className="h-11"
            disabled={isLoading}
          />
        </Field>
      </FieldGroup>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!title.trim() || isLoading}
        className="w-full h-11 bg-accent-action text-white hover:bg-accent-action/90"
      >
        {isLoading ? (
          <>
            <Spinner className="size-4 mr-2" />
            Fetching recipe...
          </>
        ) : (
          'Add Recipe'
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        {"We'll auto-extract details if a link is provided"}
      </p>
    </div>
  )
}
