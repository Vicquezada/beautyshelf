import type { ClaudeProductResult } from '../types'

const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string

export interface CapturedImage {
  data: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
}

export async function analyzeProductImages(
  images: CapturedImage[],
  token: string
): Promise<ClaudeProductResult> {
  const res = await fetch(`${functionsUrl}/analyze-product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ images }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Errore analisi: ${res.status}`)
  }

  return res.json() as Promise<ClaudeProductResult>
}

export async function fileToBase64(file: File): Promise<CapturedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      const mediaType = file.type as CapturedImage['mediaType']
      resolve({ data: base64, mediaType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
