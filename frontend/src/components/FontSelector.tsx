import { useState, useEffect } from 'react'
import { Type } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ReaderFont = 
  | 'crimson-pro'
  | 'eb-garamond'
  | 'lora'
  | 'merriweather'
  | 'libre-baskerville'
  | 'cormorant-garamond'
  | 'spectral'

interface FontOption {
  value: ReaderFont
  label: string
  description: string
  fontFamily: string
}

export const READER_FONTS: FontOption[] = [
  // Calligraphy-inspired fonts (antique look)
  {
    value: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    description: 'Calligraphic flourishes',
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    value: 'spectral',
    label: 'Spectral',
    description: 'Calligraphic modern',
    fontFamily: "'Spectral', serif",
  },
  // Classic serif fonts
  {
    value: 'crimson-pro',
    label: 'Crimson Pro',
    description: 'Old-world elegance',
    fontFamily: "'Crimson Pro', serif",
  },
  {
    value: 'eb-garamond',
    label: 'EB Garamond',
    description: 'Historic Latin style',
    fontFamily: "'EB Garamond', serif",
  },
  {
    value: 'lora',
    label: 'Lora',
    description: 'Calligraphic elegance',
    fontFamily: "'Lora', serif",
  },
  {
    value: 'merriweather',
    label: 'Merriweather',
    description: 'Modern classic',
    fontFamily: "'Merriweather', serif",
  },
  {
    value: 'libre-baskerville',
    label: 'Libre Baskerville',
    description: '18th century refined',
    fontFamily: "'Libre Baskerville', serif",
  },
]

const STORAGE_KEY = 'reader-font-preference'

interface FontSelectorProps {
  onFontChange?: (fontFamily: string) => void
}

// Default font for reader mode - can be changed in one place
const DEFAULT_FONT: ReaderFont = 'cormorant-garamond'
const DEFAULT_FONT_FAMILY = "'Cormorant Garamond', serif"

export function FontSelector({ onFontChange }: FontSelectorProps) {
  const [selectedFont, setSelectedFont] = useState<ReaderFont>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved as ReaderFont) || DEFAULT_FONT
  })

  useEffect(() => {
    const font = READER_FONTS.find((f) => f.value === selectedFont)
    if (font && onFontChange) {
      onFontChange(font.fontFamily)
    }
  }, [selectedFont, onFontChange])

  const handleFontChange = (value: ReaderFont) => {
    setSelectedFont(value)
    localStorage.setItem(STORAGE_KEY, value)
    const font = READER_FONTS.find((f) => f.value === value)
    if (font && onFontChange) {
      onFontChange(font.fontFamily)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Type className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedFont} onValueChange={handleFontChange}>
        <SelectTrigger className="w-[180px] h-8 text-sm">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {READER_FONTS.map((font) => (
            <SelectItem
              key={font.value}
              value={font.value}
              className="flex flex-col items-start"
            >
              <span style={{ fontFamily: font.fontFamily }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function getStoredFontFamily(): string {
  const saved = localStorage.getItem(STORAGE_KEY) as ReaderFont | null
  if (!saved) return DEFAULT_FONT_FAMILY
  const font = READER_FONTS.find((f) => f.value === saved)
  return font?.fontFamily ?? DEFAULT_FONT_FAMILY
}
