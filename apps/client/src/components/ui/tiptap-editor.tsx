"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  ChevronDown,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
}

function ToolbarItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const isLinkActive = editor.isActive("link");

  useEffect(() => {
    if (open) {
      setUrl(editor.getAttributes("link").href || "");
    }
  }, [open, editor]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href =
        cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
          ? cleanUrl
          : `https://${cleanUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href, target: "_blank" })
        .run();
    }
    setOpen(false);
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={isLinkActive}
              aria-label="Link"
              className="size-8 p-0"
            >
              <LinkIcon className="size-4" />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4} className="text-xs">
          Insert or edit link
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-3" align="start">
        <form onSubmit={handleApply} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Link URL</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            {isLinkActive ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleRemove}
              >
                Remove
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 px-3 text-xs">
                Apply
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function BlockTypeSelector({ editor }: { editor: Editor }) {
  const getCurrentLabel = () => {
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("codeBlock")) return "Code block";
    return "Paragraph";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs font-normal"
        >
          <span>{getCurrentLabel()}</span>
          <ChevronDown className="text-muted-foreground size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="cursor-pointer text-xs"
        >
          Paragraph
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="cursor-pointer text-xs font-semibold"
        >
          Heading 2
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className="cursor-pointer text-xs font-medium"
        >
          Heading 3
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="cursor-pointer font-mono text-xs"
        >
          Code block
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  minHeight = "200px",
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write encyclopedia article content...",
      }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none p-3.5 text-sm leading-relaxed focus:outline-none",
          "[&_p]:mb-2.5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1.5",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync content if changed externally (e.g. locale change)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div
      className={cn(
        "border-input bg-background focus-within:ring-ring overflow-hidden rounded-lg border transition-colors focus-within:ring-1",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <TooltipProvider delayDuration={150}>
        {/* Shadcn Powered Tiptap Toolbar */}
        <div className="bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1 text-xs">
          {editor && <BlockTypeSelector editor={editor} />}

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* Text Formatting Toggles */}
          <ToolbarItem label="Bold">
            <Toggle
              size="sm"
              pressed={editor?.isActive("bold")}
              onPressedChange={() => editor?.chain().focus().toggleBold().run()}
              disabled={disabled || !editor}
              aria-label="Bold"
              className="size-8 p-0"
            >
              <Bold className="size-4" />
            </Toggle>
          </ToolbarItem>

          <ToolbarItem label="Italic">
            <Toggle
              size="sm"
              pressed={editor?.isActive("italic")}
              onPressedChange={() =>
                editor?.chain().focus().toggleItalic().run()
              }
              disabled={disabled || !editor}
              aria-label="Italic"
              className="size-8 p-0"
            >
              <Italic className="size-4" />
            </Toggle>
          </ToolbarItem>

          <ToolbarItem label="Strikethrough">
            <Toggle
              size="sm"
              pressed={editor?.isActive("strike")}
              onPressedChange={() =>
                editor?.chain().focus().toggleStrike().run()
              }
              disabled={disabled || !editor}
              aria-label="Strikethrough"
              className="size-8 p-0"
            >
              <Strikethrough className="size-4" />
            </Toggle>
          </ToolbarItem>

          <ToolbarItem label="Inline code">
            <Toggle
              size="sm"
              pressed={editor?.isActive("code")}
              onPressedChange={() => editor?.chain().focus().toggleCode().run()}
              disabled={disabled || !editor}
              aria-label="Inline code"
              className="size-8 p-0"
            >
              <Code className="size-4" />
            </Toggle>
          </ToolbarItem>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* Lists & Quotes */}
          <ToolbarItem label="Bullet list">
            <Toggle
              size="sm"
              pressed={editor?.isActive("bulletList")}
              onPressedChange={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
              disabled={disabled || !editor}
              aria-label="Bullet list"
              className="size-8 p-0"
            >
              <List className="size-4" />
            </Toggle>
          </ToolbarItem>

          <ToolbarItem label="Numbered list">
            <Toggle
              size="sm"
              pressed={editor?.isActive("orderedList")}
              onPressedChange={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
              disabled={disabled || !editor}
              aria-label="Numbered list"
              className="size-8 p-0"
            >
              <ListOrdered className="size-4" />
            </Toggle>
          </ToolbarItem>

          <ToolbarItem label="Blockquote">
            <Toggle
              size="sm"
              pressed={editor?.isActive("blockquote")}
              onPressedChange={() =>
                editor?.chain().focus().toggleBlockquote().run()
              }
              disabled={disabled || !editor}
              aria-label="Blockquote"
              className="size-8 p-0"
            >
              <Quote className="size-4" />
            </Toggle>
          </ToolbarItem>

          {/* Link Popover */}
          {editor && <LinkPopover editor={editor} />}

          <ToolbarItem label="Divider">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              disabled={disabled || !editor}
              aria-label="Divider"
            >
              <Minus className="size-4" />
            </Button>
          </ToolbarItem>

          <ToolbarItem label="Clear formatting">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() =>
                editor?.chain().focus().clearNodes().unsetAllMarks().run()
              }
              disabled={disabled || !editor}
              aria-label="Clear formatting"
            >
              <RemoveFormatting className="size-4" />
            </Button>
          </ToolbarItem>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          {/* History */}
          <ToolbarItem label="Undo">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={disabled || !editor || !editor.can().undo()}
              aria-label="Undo"
            >
              <Undo className="size-4" />
            </Button>
          </ToolbarItem>

          <ToolbarItem label="Redo">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={disabled || !editor || !editor.can().redo()}
              aria-label="Redo"
            >
              <Redo className="size-4" />
            </Button>
          </ToolbarItem>
        </div>
      </TooltipProvider>

      {/* Editor Content Area */}
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
