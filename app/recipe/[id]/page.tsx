'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { IngredientChecklist } from '@/components/ingredient-checklist'
import { StepList } from '@/components/step-list'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { ManualRecipeForm } from '@/components/manual-recipe-form'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { useRecipes } from '@/hooks/use-recipes'
import type { Recipe } from '@/lib/types'
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  EditIcon,
  ShareIcon,
  HeartIcon,
  PlayIcon,
} from 'lucide-react'
import { encodeRecipeForShare } from '@/lib/recipe-storage'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { getRecipe, saveRecipe, deleteRecipe, toggleFavorite } = useRecipes()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  useEffect(() => {
    const r = getRecipe(id)
    if (r) {
      setRecipe(r)
      setNotes(r.notes || '')
    } else {
      router.replace('/')
    }
  }, [id, getRecipe, router])

  const handleToggleIngredient = useCallback(
    (ingredient: string) => {
      if (!recipe) return

      const newChecked = recipe.checkedIngredients.includes(ingredient)
        ? recipe.checkedIngredients.filter((i) => i !== ingredient)
        : [...recipe.checkedIngredients, ingredient]

      const updatedRecipe = { ...recipe, checkedIngredients: newChecked }
      setRecipe(updatedRecipe)
      saveRecipe(updatedRecipe)
    },
    [recipe, saveRecipe]
  )

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value)
      setNotesSaved(false)

      // Auto-save with debounce
      const timeout = setTimeout(() => {
        if (recipe) {
          const updatedRecipe = { ...recipe, notes: value }
          setRecipe(updatedRecipe)
          saveRecipe(updatedRecipe)
          setNotesSaved(true)
          setTimeout(() => setNotesSaved(false), 2000)
        }
      }, 800)

      return () => clearTimeout(timeout)
    },
    [recipe, saveRecipe]
  )

  const handleShare = useCallback(() => {
    if (!recipe) return

    const encoded = encodeRecipeForShare(recipe)
    const shareUrl = `${window.location.origin}/share?data=${encoded}`

    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }, [recipe])

  const handleToggleFavorite = useCallback(() => {
    if (!recipe) return
    toggleFavorite(recipe.id)
    setRecipe({ ...recipe, favorite: !recipe.favorite })
    toast.success(recipe.favorite ? 'Removed from favorites' : 'Added to favorites')
  }, [recipe, toggleFavorite])

  const handleDelete = useCallback(() => {
    if (!recipe) return
    deleteRecipe(recipe.id)
    toast.success('Recipe deleted')
    router.push('/')
  }, [recipe, deleteRecipe, router])

  const handleEditSave = useCallback(
    (updatedRecipe: Recipe) => {
      saveRecipe(updatedRecipe)
      setRecipe(updatedRecipe)
      setNotes(updatedRecipe.notes || '')
      setIsEditing(false)
      toast.success('Recipe updated')
    },
    [saveRecipe]
  )

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SharedHeader />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <ArrowLeftIcon className="size-4 mr-1" />
              Cancel
            </Button>
          </div>
          <ManualRecipeForm
            initialData={recipe}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
          <div className="mt-6 pt-6 border-t border-border">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Recipe
            </Button>
          </div>
        </main>
        <SharedFooter />
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          recipeName={recipe.title}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SharedHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeftIcon className="size-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-1">
            {recipe.url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                  Go to site
                  <ExternalLinkIcon className="size-4 ml-1" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={handleToggleFavorite}>
              <HeartIcon
                className={`size-4 ${
                  recipe.favorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                }`}
              />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)}>
              <EditIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleShare}>
              <ShareIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Recipe Title Section */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Added {formatDate(recipe.savedDate)}
          </p>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            {recipe.title}
          </h1>
        </div>

        {/* Cook Button - Primary CTA */}
        <Button
          asChild
          size="lg"
          className="w-full bg-accent-action text-white hover:bg-accent-action/90"
        >
          <Link href={`/recipe/${recipe.id}/cook`}>
            <PlayIcon className="size-5 mr-2" />
            Start Cooking
          </Link>
        </Button>

        {/* Ingredients */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <IngredientChecklist
              ingredients={recipe.ingredients}
              checkedItems={recipe.checkedIngredients}
              onToggle={handleToggleIngredient}
            />
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <StepList steps={recipe.steps} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notes</CardTitle>
              {notesSaved && (
                <span className="text-xs text-muted-foreground">Saved</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <Textarea
              placeholder="Add notes about this recipe..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </main>

      <SharedFooter />
    </div>
  )
}
