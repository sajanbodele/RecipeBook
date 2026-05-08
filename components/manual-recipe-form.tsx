'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { XIcon, SaveIcon } from 'lucide-react'
import type { Recipe } from '@/lib/types'
import { generateId } from '@/lib/recipe-storage'

interface ManualRecipeFormProps {
  onSave: (recipe: Recipe) => void
  onCancel: () => void
  initialData?: Partial<Recipe>
  initialTitle?: string
}

export function ManualRecipeForm({ onSave, onCancel, initialData, initialTitle }: ManualRecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title || initialTitle || '')
  const [url, setUrl] = useState(initialData?.url || '')
  const [ingredientsText, setIngredientsText] = useState(
    initialData?.ingredients?.join('\n') || ''
  )
  const [stepsText, setStepsText] = useState(initialData?.steps?.join('\n') || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const recipe: Recipe = {
      id: initialData?.id || generateId(),
      title: title.trim() || 'Untitled Recipe',
      url: url.trim(),
      ingredients: ingredientsText
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      steps: stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      savedDate: initialData?.savedDate || new Date().toISOString(),
      notes: notes.trim(),
      checkedIngredients: initialData?.checkedIngredients || [],
      favorite: initialData?.favorite || false,
    }

    onSave(recipe)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {initialData?.id ? 'Edit Recipe' : 'Add Recipe'}
          </CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={onCancel}>
            <XIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              placeholder="Enter recipe title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Source URL (optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients (one per line)</Label>
            <Textarea
              id="ingredients"
              placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup sugar..."
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Instructions (one step per line)</Label>
            <Textarea
              id="steps"
              placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients..."
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-accent-action text-white hover:bg-accent-action/90">
              <SaveIcon className="size-4 mr-2" />
              Save Recipe
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
