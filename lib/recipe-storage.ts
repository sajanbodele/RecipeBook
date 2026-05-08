import type { Recipe } from './types'

const STORAGE_KEY = 'recipebook_recipes'

export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRecipe(recipe: Recipe): void {
  const recipes = getRecipes()
  const index = recipes.findIndex((r) => r.id === recipe.id)
  if (index >= 0) {
    recipes[index] = recipe
  } else {
    recipes.unshift(recipe)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}

export function deleteRecipe(id: string): void {
  const recipes = getRecipes().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}

export function getRecipeById(id: string): Recipe | undefined {
  return getRecipes().find((r) => r.id === id)
}

export function getRecipeByUrl(url: string): Recipe | undefined {
  return getRecipes().find((r) => r.url === url)
}

export function exportRecipes(): string {
  return JSON.stringify(getRecipes(), null, 2)
}

export function importRecipes(json: string): { imported: number; skipped: number } {
  try {
    const imported: Recipe[] = JSON.parse(json)
    const existing = getRecipes()
    const existingUrls = new Set(existing.map((r) => r.url))
    
    let importedCount = 0
    let skippedCount = 0
    
    for (const recipe of imported) {
      if (existingUrls.has(recipe.url)) {
        skippedCount++
      } else {
        existing.unshift(recipe)
        existingUrls.add(recipe.url)
        importedCount++
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return { imported: importedCount, skipped: skippedCount }
  } catch {
    throw new Error('Invalid JSON file')
  }
}

export function encodeRecipeForShare(recipe: Recipe): string {
  const shareData = {
    title: recipe.title,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    url: recipe.url,
  }
  return btoa(encodeURIComponent(JSON.stringify(shareData)))
}

export function decodeSharedRecipe(encoded: string): Partial<Recipe> | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function toggleFavorite(id: string): boolean {
  const recipes = getRecipes()
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return false
  recipe.favorite = !recipe.favorite
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
  return recipe.favorite
}
