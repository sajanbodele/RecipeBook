import { NextRequest, NextResponse } from 'next/server'

// Clean HTML and normalize whitespace
function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

// Check if text is a vague heading that should be skipped
function isVagueHeading(text: string): boolean {
  const lower = text.toLowerCase().trim()
  const vaguePatterns = [
    /^(step\s*\d*\.?|preparation|making|method|directions?|instructions?|procedure|notes?|tips?)$/i,
    /^(for the|to make|how to)$/i,
    /^(ingredients?|recipe)$/i,
  ]
  return vaguePatterns.some((p) => p.test(lower)) || lower.length < 10
}

// Parse instruction text into cooking steps - groups by cooking phases, not sentences
function parseInstructionText(text: string): string[] {
  if (!text || typeof text !== 'string') return []

  const cleaned = cleanText(text)
  if (!cleaned || cleaned.length < 15) return []

  // Split on explicit step markers (numbered steps, "Step X:", double newlines in source)
  const explicitSplits = cleaned.split(/(?:\d+[\.\)]\s+|\bStep\s*\d+[:\.\s]+)/i)

  const result: string[] = []

  for (const part of explicitSplits) {
    const trimmed = part.trim()
    if (!trimmed || isVagueHeading(trimmed)) continue

    // If very long (>500 chars), it may contain multiple cooking phases
    // Split only on major phase transitions, not every sentence
    if (trimmed.length > 500) {
      // Split on cooking phase transitions
      const phases = trimmed.split(
        /(?<=[.!])\s+(?=(?:Meanwhile|While|Once|When|After|Now|Next|Then|Finally|To serve|For serving|To finish)[,\s])/i
      )
      
      for (const phase of phases) {
        const p = phase.trim()
        if (p && !isVagueHeading(p) && p.length >= 15) {
          result.push(ensurePunctuation(p))
        }
      }
    } else if (trimmed.length >= 15) {
      result.push(ensurePunctuation(trimmed))
    }
  }

  return result
}

// Ensure step ends with proper punctuation
function ensurePunctuation(text: string): string {
  const trimmed = text.trim()
  if (/[.!?]$/.test(trimmed)) return trimmed
  return trimmed + '.'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the recipe page
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let html: string
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RecipeBook/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Could not fetch recipe page' },
          { status: 400 }
        )
      }

      html = await response.text()
    } catch (error) {
      clearTimeout(timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Try adding the recipe manually.' },
          { status: 408 }
        )
      }
      return NextResponse.json(
        { error: 'Could not fetch recipe page' },
        { status: 400 }
      )
    }

    // Try to find JSON-LD recipe schema
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )

    let recipe = null

    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonContent = match.replace(
            /<script[^>]*>|<\/script>/gi,
            ''
          )
          const parsed = JSON.parse(jsonContent)

          // Handle both single recipe and array of schemas
          const schemas = Array.isArray(parsed) ? parsed : [parsed]
          
          for (const schema of schemas) {
            if (schema['@type'] === 'Recipe' || 
                (Array.isArray(schema['@type']) && schema['@type'].includes('Recipe'))) {
              recipe = schema
              break
            }
            // Check @graph for recipe
            if (schema['@graph']) {
              const found = schema['@graph'].find(
                (item: { '@type'?: string | string[] }) =>
                  item['@type'] === 'Recipe' ||
                  (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
              )
              if (found) {
                recipe = found
                break
              }
            }
          }
          if (recipe) break
        } catch {
          continue
        }
      }
    }

    if (recipe) {
      // Extract recipe data from JSON-LD
      const title = recipe.name || 'Untitled Recipe'
      
      // Parse ingredients
      let ingredients: string[] = []
      if (recipe.recipeIngredient) {
        ingredients = Array.isArray(recipe.recipeIngredient)
          ? recipe.recipeIngredient
          : [recipe.recipeIngredient]
      }

      // Parse steps - produce detailed, actionable cooking instructions
      let steps: string[] = []
      if (recipe.recipeInstructions) {
        if (Array.isArray(recipe.recipeInstructions)) {
          // Handle HowToSection (grouped steps)
          for (const instruction of recipe.recipeInstructions) {
            if (typeof instruction === 'string') {
              // Split long strings on sentence boundaries or numbered steps
              const parsed = parseInstructionText(instruction)
              steps.push(...parsed)
            } else if (instruction['@type'] === 'HowToSection' && instruction.itemListElement) {
              // Section with nested steps
              for (const item of instruction.itemListElement) {
                if (typeof item === 'string') {
                  steps.push(...parseInstructionText(item))
                } else {
                  const text = item.text || item.name || ''
                  if (text) steps.push(...parseInstructionText(text))
                }
              }
            } else if (instruction['@type'] === 'HowToStep') {
              const text = instruction.text || instruction.name || ''
              if (text) steps.push(...parseInstructionText(text))
            } else {
              const text = instruction.text || instruction.name || ''
              if (text) steps.push(...parseInstructionText(text))
            }
          }
        } else if (typeof recipe.recipeInstructions === 'string') {
          steps = parseInstructionText(recipe.recipeInstructions)
        }
      }

      // Filter out empty/invalid steps
      steps = steps
        .map((s) => s.trim())
        .filter((s) => {
          if (!s || s.length < 5) return false
          // Skip vague/heading-only steps
          const lower = s.toLowerCase()
          if (/^(step\s*\d+\.?|preparation|making|ingredients?|instructions?)$/i.test(lower)) return false
          return true
        })

      // Fallback if steps are incomplete
      if (steps.length === 0) {
        steps = ['Instructions are incomplete. Please view original recipe.']
      }

      return NextResponse.json({
        title,
        ingredients,
        steps,
      })
    }

    // Fallback: Try to extract from HTML meta tags or common patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Recipe'

    return NextResponse.json({
      title,
      ingredients: [],
      steps: [],
      needsManualEntry: true,
    })

  } catch (error) {
    console.error('Recipe parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse recipe' },
      { status: 500 }
    )
  }
}
