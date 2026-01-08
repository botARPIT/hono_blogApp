import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { useEffect, useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2, Type, Highlighter, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const FONTS = [
  { label: 'Sans Serif', value: 'Inter, ui-sans-serif, system-ui' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Cursive', value: 'cursive' },
]

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [activeFont, setActiveFont] = useState('Font')
  const [, forceUpdate] = useState({})

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    // This fires on every state change including format toggles
    onTransaction: () => {
      // Force re-render to update toolbar button states immediately
      forceUpdate({})
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground selection:bg-primary/30',
      },
    },
  })

  // Update active font label when editor state changes
  const updateActiveFont = useCallback(() => {
    if (!editor) return
    for (const font of FONTS) {
      if (editor.isActive('textStyle', { fontFamily: font.value })) {
        setActiveFont(font.label)
        return
      }
    }
    setActiveFont('Font')
  }, [editor])

  useEffect(() => {
    if (editor) {
      updateActiveFont()
    }
  }, [editor, updateActiveFont])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const handleFontChange = (fontValue: string, fontLabel: string) => {
    editor.chain().focus().setFontFamily(fontValue).run()
    setActiveFont(fontLabel)
  }

  const handleResetFont = () => {
    editor.chain().focus().unsetFontFamily().run()
    setActiveFont('Font')
  }

  // Helper to get button active class
  const getActiveClass = (isActive: boolean) => 
    isActive 
      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
      : 'hover:bg-muted'

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="border-b p-2 flex gap-1.5 flex-wrap bg-muted/50 items-center">
        {/* Font Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 cursor-pointer min-w-[120px] justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span>{activeFont}</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px]">
            {FONTS.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => handleFontChange(font.value, font.label)}
                className={`cursor-pointer ${activeFont === font.label ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
              >
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={handleResetFont}
              className="cursor-pointer"
            >
              Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('bold'))}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('italic'))}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('highlight'))}`}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('heading', { level: 1 }))}`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('heading', { level: 2 }))}`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('bulletList'))}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`cursor-pointer ${getActiveClass(editor.isActive('orderedList'))}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="cursor-pointer hover:bg-muted"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="cursor-pointer hover:bg-muted"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[300px]" />
    </div>
  )
}
