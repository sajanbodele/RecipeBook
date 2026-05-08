export interface Recipe {
  id: string
  title: string
  url: string
  ingredients: string[]
  steps: string[]
  savedDate: string
  notes: string
  checkedIngredients: string[]
  favorite?: boolean
}

export interface ParsedRecipe {
  title: string
  ingredients: string[]
  steps: string[]
}
