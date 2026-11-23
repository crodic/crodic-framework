import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import 'react-image-crop/dist/ReactCrop.css'
import { RichTextProvider } from 'reactjs-tiptap-editor'
import { RichTextBold } from 'reactjs-tiptap-editor/bold'
import { RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist'
import { RichTextClear } from 'reactjs-tiptap-editor/clear'
import { RichTextHeading } from 'reactjs-tiptap-editor/heading'
import { RichTextRedo, RichTextUndo } from 'reactjs-tiptap-editor/history'
import { RichTextImage } from 'reactjs-tiptap-editor/image'
import { RichTextIndent } from 'reactjs-tiptap-editor/indent'
import { RichTextItalic } from 'reactjs-tiptap-editor/italic'
import { RichTextLink } from 'reactjs-tiptap-editor/link'
import { RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist'
import { RichTextStrike } from 'reactjs-tiptap-editor/strike'
import 'reactjs-tiptap-editor/style.css'
import { RichTextAlign } from 'reactjs-tiptap-editor/textalign'
import { RichTextUnderline } from 'reactjs-tiptap-editor/textunderline'
import { themeActions } from 'reactjs-tiptap-editor/theme'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { extensions } from './extensions'
import { debounce } from './utils'

interface Props {
  output: 'html' | 'text' | 'json'
  content: string | undefined
  onChangeContent: (value: string) => void
  disabled: boolean
  className?: string
  extensions?: any[]
}

type EditorThemeColor =
  'default' | 'blue' | 'red' | 'violet' | 'yellow' | 'green' | 'orange' | 'rose'

function getEditorThemeColor(colorKey: string): EditorThemeColor {
  if (colorKey === 'pink') {
    return 'rose'
  }

  if (
    colorKey === 'blue' ||
    colorKey === 'red' ||
    colorKey === 'violet' ||
    colorKey === 'yellow' ||
    colorKey === 'green' ||
    colorKey === 'orange'
  ) {
    return colorKey
  }

  return 'default'
}

function serializeEditorOutput(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  output: Props['output']
): string {
  if (output === 'text') return editor.getText()
  if (output === 'json') return JSON.stringify(editor.getJSON())
  return editor.getHTML()
}

function TiptapEditor({ className, ...props }: Props) {
  const { colorKey, resolvedTheme } = useTheme()

  const onChangeRef = useRef(props.onChangeContent)
  useEffect(() => {
    onChangeRef.current = props.onChangeContent
  }, [props.onChangeContent])

  const onValueChange = useMemo(
    () =>
      debounce((value: string) => {
        onChangeRef.current(value)
      }, 300),
    []
  )

  const editor = useEditor({
    content: props.content || '',
    editable: !props.disabled,
    extensions: props.extensions || extensions,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const value = serializeEditorOutput(editor, props.output)

      onValueChange(value)
    },
  })

  useEffect(() => {
    editor?.setEditable(!props.disabled, false)
  }, [editor, props.disabled])

  useEffect(() => {
    themeActions.setTheme(resolvedTheme)
    themeActions.setColor(getEditorThemeColor(colorKey))
  }, [colorKey, resolvedTheme])

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return
    }

    const content = props.content || ''
    const currentContent = serializeEditorOutput(editor, props.output)

    if (content !== currentContent) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [editor, props.content, props.output])

  return (
    <div className={cn('relative', className)}>
      {editor ? (
        <div
          className='bg-background overflow-hidden rounded-lg'
          style={{ border: '1px solid var(--border)' }}
        >
          <RichTextProvider editor={editor} dark={resolvedTheme === 'dark'}>
            <div className='flex max-h-full w-full flex-col'>
              <div
                className='flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2'
                style={{ borderBottom: '1px solid hsl(var(--border))' }}
              >
                <RichTextUndo />
                <RichTextRedo />
                <RichTextClear />
                <RichTextHeading />
                <RichTextBold />
                <RichTextItalic />
                <RichTextUnderline />
                <RichTextStrike />
                <RichTextBulletList />
                <RichTextOrderedList />
                <RichTextAlign />
                <RichTextIndent />
                <RichTextLink />
                <RichTextImage />
              </div>

              <EditorContent className='min-h-[220px] p-2' editor={editor} />
            </div>
          </RichTextProvider>
        </div>
      ) : null}
    </div>
  )
}

export default TiptapEditor
