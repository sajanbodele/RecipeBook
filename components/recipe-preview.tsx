'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckIcon, XIcon } from 'lucide-react'
import type { ParsedRecipe } from '@/lib/types'

interface RecipePreviewProps {
  recipe: ParsedRecipe
  url: string
  onSave: () => void
  onCancel: () => void
}

export function RecipePreview({ recipe, url, onSave, onCancel }: RecipePreviewProps) {
  return (
    <Card className="border-accent-action/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <CardTitle className="text-lg">{recipe.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 truncate">{url}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={onCancel}>
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Ingredients ({recipe.ingredients.length})
          </h4>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {recipe.ingredients.slice(0, 5).map((ing, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {ing}
              </li>
            ))}
            {recipe.ingredients.length > 5 && (
              <li className="text-sm text-muted-foreground">
                +{recipe.ingredients.length - 5} more...
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Steps ({recipe.steps.length})
          </h4>
          <p className="text-sm text-muted-foreground">
            {recipe.steps.length} steps to complete
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onSave} className="flex-1 bg-accent-action text-white hover:bg-accent-action/90">
            <CheckIcon className="size-4 mr-2" />
            Save Recipe
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
