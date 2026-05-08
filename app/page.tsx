'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RecipeInput } from '@/components/recipe-input'
import { RecipeCard } from '@/components/recipe-card'
import { SearchBar } from '@/components/search-bar'
import { RecipePreview } from '@/components/recipe-preview'
import { ManualRecipeForm } from '@/components/manual-recipe-form'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { Empty } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { useRecipes } from '@/hooks/use-recipes'
import { generateId, getRecipeByUrl } from '@/lib/recipe-storage'
import type { Recipe, ParsedRecipe } from '@/lib/types'
import { BookOpenIcon, HeartIcon, CheckSquareIcon, Trash2Icon, XIcon } from 'lucide-react'

type Tab = 'add' | 'recipes'

export default function HomePage() {
  const router = useRouter()
  const { recipes, isLoading, saveRecipe, deleteRecipe, toggleFavorite } = useRecipes()
  const [activeTab, setActiveTab] = useState<Tab>('add')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewRecipe, setPreviewRecipe] = useState<{
    recipe: ParsedRecipe
    url: string
  } | null>(null)
  const [manualFormTitle, setManualFormTitle] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null)

  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  const filteredRecipes = useMemo(() => {
    let result = recipes

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((r) => r.favorite)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(query))
      )
    }

    return result
  }, [recipes, searchQuery, showFavoritesOnly])

  const handleRecipeParsed = useCallback((parsed: ParsedRecipe, url: string) => {
    setPreviewRecipe({ recipe: parsed, url })
  }, [])

  const handleSavePreview = useCallback(() => {
    if (!previewRecipe) return

    const recipe: Recipe = {
      id: generateId(),
      title: previewRecipe.recipe.title,
      url: previewRecipe.url,
      ingredients: previewRecipe.recipe.ingredients,
      steps: previewRecipe.recipe.steps,
      savedDate: new Date().toISOString(),
      notes: '',
      checkedIngredients: [],
      favorite: false,
    }

    saveRecipe(recipe)
    setPreviewRecipe(null)
    toast.success('Recipe saved!')
    router.push(`/recipe/${recipe.id}`)
  }, [previewRecipe, saveRecipe, router])

  const handleManualAdd = useCallback((title: string) => {
    setManualFormTitle(title)
  }, [])

  const handleManualSave = useCallback(
    (recipe: Recipe) => {
      saveRecipe(recipe)
      setManualFormTitle(null)
      toast.success('Recipe saved!')
      router.push(`/recipe/${recipe.id}`)
    },
    [saveRecipe, router]
  )

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteRecipe(deleteTarget.id)
    setDeleteTarget(null)
    toast.success('Recipe deleted')
  }, [deleteTarget, deleteRecipe])

  const checkDuplicate = useCallback((url: string) => {
    return !!getRecipeByUrl(url)
  }, [])

  const handleDuplicateFound = useCallback(
    (url: string) => {
      const existing = getRecipeByUrl(url)
      if (existing) {
        toast.info('Recipe already saved', {
          action: {
            label: 'View',
            onClick: () => router.push(`/recipe/${existing.id}`),
          },
        })
      }
    },
    [router]
  )

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleBulkDelete = useCallback(() => {
    selectedIds.forEach((id) => deleteRecipe(id))
    toast.success(`Deleted ${selectedIds.size} recipe${selectedIds.size > 1 ? 's' : ''}`)
    setSelectedIds(new Set())
    setSelectMode(false)
    setShowBulkDeleteDialog(false)
  }, [selectedIds, deleteRecipe])

  const exitSelectMode = useCallback(() => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SharedHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4">
        {/* Tabs - centered with margin top */}
        <div className="flex justify-center gap-2 mt-20 mb-8">
          <Button
            variant={activeTab === 'add' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('add')
              setPreviewRecipe(null)
              setManualFormTitle(null)
            }}
            className={`rounded-full px-6 ${
              activeTab === 'add' ? 'bg-foreground text-background' : ''
            }`}
          >
            Add Recipe
          </Button>
          <Button
            variant={activeTab === 'recipes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recipes')}
            className={`rounded-full px-6 ${
              activeTab === 'recipes' ? 'bg-foreground text-background' : ''
            }`}
          >
            My Recipes
          </Button>
        </div>

        {/* Dynamic Content */}
        <div className="max-w-xl mx-auto">
          {activeTab === 'add' && (
            <>
              {/* Add Recipe Form */}
              {!previewRecipe && manualFormTitle === null && (
                <RecipeInput
                  onRecipeParsed={handleRecipeParsed}
                  onManualAdd={handleManualAdd}
                  checkDuplicate={checkDuplicate}
                  onDuplicateFound={handleDuplicateFound}
                />
              )}

              {/* Preview Card */}
              {previewRecipe && (
                <RecipePreview
                  recipe={previewRecipe.recipe}
                  url={previewRecipe.url}
                  onSave={handleSavePreview}
                  onCancel={() => setPreviewRecipe(null)}
                />
              )}

              {/* Manual Form */}
              {manualFormTitle !== null && (
                <ManualRecipeForm
                  initialTitle={manualFormTitle}
                  onSave={handleManualSave}
                  onCancel={() => setManualFormTitle(null)}
                />
              )}
            </>
          )}
        </div>

        {/* My Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Header row with title and controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">My Recipes</h2>
              
              {recipes.length > 0 && (
                <div className="flex items-center gap-2">
                  {selectMode ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowBulkDeleteDialog(true)}
                        disabled={selectedIds.size === 0}
                      >
                        <Trash2Icon className="size-4 mr-1" />
                        Delete ({selectedIds.size})
                      </Button>
                      <Button variant="outline" size="sm" onClick={exitSelectMode}>
                        <XIcon className="size-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={showFavoritesOnly ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={showFavoritesOnly ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                      >
                        <HeartIcon className={`size-4 mr-1 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                        Favourites
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectMode(true)}
                      >
                        <CheckSquareIcon className="size-4 mr-1" />
                        Select
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {recipes.length > 0 && (
              <>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  resultCount={searchQuery || showFavoritesOnly ? filteredRecipes.length : undefined}
                />

                {/* Recipe Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onToggleFavorite={toggleFavorite}
                      selectable={selectMode}
                      selected={selectedIds.has(recipe.id)}
                      onSelect={handleToggleSelect}
                    />
                  ))}
                </div>

                {(searchQuery || showFavoritesOnly) && filteredRecipes.length === 0 && (
                  <Empty
                    title={showFavoritesOnly ? 'No favourites yet' : 'No recipes found'}
                    description={
                      showFavoritesOnly
                        ? 'Heart some recipes to see them here.'
                        : `No recipes match "${searchQuery}". Try different keywords.`
                    }
                  />
                )}
              </>
            )}

            {recipes.length === 0 && (
              <Empty
                icon={BookOpenIcon}
                title="No recipes yet"
                description="Switch to the Add Recipe tab to get started."
              />
            )}
          </div>
        )}
      </main>

      <SharedFooter />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        recipeName={deleteTarget?.title || ''}
        onConfirm={handleDelete}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        recipeName={`${selectedIds.size} recipe${selectedIds.size > 1 ? 's' : ''}`}
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
