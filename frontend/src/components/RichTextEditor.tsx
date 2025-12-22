import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { useEffect } from 'react'
import { Button } from './ui/button'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2, Type, Highlighter } from 'lucide-react'
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
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground selection:bg-primary/30',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="border-b p-2 flex gap-2 flex-wrap bg-muted/50 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Font</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FONTS.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
                className={editor.isActive('textStyle', { fontFamily: font.value }) ? 'bg-accent' : ''}
              >
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => editor.chain().focus().unsetFontFamily().run()}>
              Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'bg-accent text-accent-foreground' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[300px]" />
    </div>
  )
}

