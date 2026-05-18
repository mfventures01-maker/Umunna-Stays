/**
 * TiptapEditor.tsx — Reusable Rich Text Editor
 *
 * React 19 compatible. Produces clean semantic HTML.
 * Replaces react-quill completely.
 *
 * Features:
 *  - SEO-safe HTML output (H1–H4, bold, italic, lists, links, images)
 *  - Future schema injection support via `data-*` attributes
 *  - Autosave-ready via `onUpdate` callback
 *  - Markdown export compatible via getMarkdown()
 */

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import EditorToolbar from './EditorToolbar';
import { buildExtensions } from './extensions';

export interface TiptapEditorHandle {
  /** Returns the current HTML content */
  getHTML: () => string;
  /** Programmatically set new content */
  setContent: (html: string) => void;
  /** Clear the editor */
  clear: () => void;
}

interface TiptapEditorProps {
  /** Controlled HTML content */
  value: string;
  /** Called on every content change with the latest HTML */
  onChange: (html: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Minimum height (Tailwind class, e.g. 'min-h-[400px]') */
  minHeight?: string;
  /** Disabled state */
  disabled?: boolean;
}

const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start writing your article…',
      minHeight = 'min-h-[400px]',
      disabled = false,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: buildExtensions(placeholder),
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: `prose prose-slate max-w-none focus:outline-none px-6 py-5 ${minHeight}`,
        },
      },
    });

    // Sync external value changes (e.g. loading a saved draft)
    useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      if (value !== current) {
        editor.commands.setContent(value, false);
      }
    }, [value, editor]);

    // Sync disabled state
    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled);
    }, [disabled, editor]);

    // Expose imperative handle for parent components
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      setContent: (html: string) => editor?.commands.setContent(html, false),
      clear: () => editor?.commands.clearContent(),
    }));

    if (!editor) {
      return (
        <div
          className={`bg-white border border-slate-100 rounded-2xl ${minHeight} flex items-center justify-center`}
        >
          <div className="w-6 h-6 border-2 border-[#C46210] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div
        className={`bg-white border border-slate-100 rounded-2xl overflow-hidden ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {!disabled && (
          <EditorToolbar
            editor={editor}
            onInsertImage={() => {
              const url = window.prompt('Image URL:');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          />
        )}
        <EditorContent editor={editor} />
        {/* Word count footer */}
        <div className="px-6 py-2 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            {editor.storage.characterCount?.words?.() ??
              editor
                .getText()
                .split(/\s+/)
                .filter(Boolean).length}{' '}
            words
          </span>
          <span className="text-[10px] text-slate-300">TipTap — React 19 ✓</span>
        </div>
      </div>
    );
  }
);

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;
