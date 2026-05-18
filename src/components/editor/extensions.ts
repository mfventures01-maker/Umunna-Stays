/**
 * extensions.ts — TipTap Editor Extension Registry
 *
 * All editor extensions are declared here.
 * Import this in TiptapEditor.tsx — never configure extensions inline.
 */

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

export const buildExtensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4],
    },
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
    blockquote: {},
    codeBlock: {},
    horizontalRule: {},
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      class: 'text-[#C46210] underline',
    },
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class: 'rounded-xl max-w-full h-auto my-4',
      loading: 'lazy',
    },
  }),
  Placeholder.configure({
    placeholder: placeholder ?? 'Start writing your article…',
    emptyEditorClass:
      'before:content-[attr(data-placeholder)] before:float-left before:text-slate-400 before:pointer-events-none before:h-0',
  }),
];
