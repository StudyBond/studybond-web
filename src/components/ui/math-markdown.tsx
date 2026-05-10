'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import 'katex/dist/katex.min.css';
import clsx from 'clsx';

/**
 * Strict sanitization schema — extends the default safe schema with only
 * harmless formatting tags. Blocks all dangerous elements (script, iframe,
 * object, embed, form, input, etc.) and all event-handler attributes.
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // Safe formatting-only tags
    'u',     // underline
    'ins',   // inserted text (also underlined by default)
    'del',   // strikethrough
    's',     // strikethrough
    'mark',  // highlight
    'sub',   // subscript
    'sup',   // superscript
    'br',    // line break
    'span',  // inline container (needed by KaTeX)
    // GFM table tags (structural, no XSS risk)
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  attributes: {
    ...defaultSchema.attributes,
    // Allow class and style on span for KaTeX rendering
    span: ['className', 'class', 'style'],
    // Table cell alignment (GFM uses align attribute)
    th: ['align'],
    td: ['align'],
    // No attributes allowed on formatting tags — prevents event handlers
    u: [],
    ins: [],
    del: [],
    s: [],
    mark: [],
    sub: [],
    sup: [],
  },
};

interface MathMarkdownProps {
  content: string | null | undefined;
  className?: string;
  variant?: 'default' | 'question' | 'explanation' | 'option';
}

/**
 * Fast markdown and LaTeX renderer
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Markdown formatting: bold, italic, lists, etc.
 * - HTML underline: <u>text</u>
 * - HTML subscript/superscript: <sub>/<sup>
 * - XSS-safe: all dangerous HTML is stripped via rehype-sanitize
 */
export const MathMarkdown = React.memo(function MathMarkdown({
  content,
  className,
  variant = 'default',
}: MathMarkdownProps) {
  if (!content || content.trim() === '') {
    return null;
  }

  const variantClasses = {
    default: 'prose prose-sm max-w-none text-white/90',
    question: 'prose prose-base max-w-none text-white font-medium leading-relaxed',
    explanation: 'prose prose-sm max-w-none text-white/80 leading-relaxed',
    option: 'prose prose-sm max-w-none text-inherit leading-relaxed [&>p]:mb-0',
  };

  // Pre-process content to handle different LaTeX delimiters used by AI models
  const processedContent = React.useMemo(() => {
    if (!content) return '';

    return content
      // Handle inline math: \( ... \) -> $ ... $
      .replace(/\\\((.*?)\\\)/g, (_, formula) => `$${formula}$`)
      // Handle block math: \[ ... \] -> $$ ... $$
      .replace(/\\\[(.*?)\\\]/g, (_, formula) => `\n$$\n${formula}\n$$\n`)
      // Sometimes AI escapes dollar signs incorrectly or uses them raw
      // This ensures we don't break existing $ formatting
      .trim();
  }, [content]);

  return (
    <div className={clsx(variantClasses[variant], className)}>
      <style>{`
        /* KaTeX overrides for dark theme */
        .math-display {
          margin: 0.5rem 0;
          overflow-x: auto;
          padding: 0.5rem 0;
        }
        .katex {
          font-size: 1em;
          color: #ffffff;
        }
        .katex-display {
          display: block;
          margin: 0.5rem 0;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex]}
        components={{
          p: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <p className="mb-2 last:mb-0" {...rest}>{children}</p>;
          },
          ul: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <ul className="list-disc list-inside mb-2 space-y-1" {...rest}>{children}</ul>;
          },
          ol: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <ol className="list-decimal list-inside mb-2 space-y-1" {...rest}>{children}</ol>;
          },
          li: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <li className="text-white/80" {...rest}>{children}</li>;
          },
          strong: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <strong className="font-semibold text-white" {...rest}>{children}</strong>;
          },
          em: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <em className="italic text-white/90" {...rest}>{children}</em>;
          },
          code: (props) => {
            const { children, className: codeClassName, node, ...rest } = props as any;
            const inline =
              !node ||
              (node.tagName === 'code' && !codeClassName?.includes('language-'));

            return (
              <code
                className={clsx(
                  inline
                    ? 'bg-white/10 rounded px-2 py-0.5 text-xs font-mono text-white/90'
                    : 'block bg-white/5 rounded p-2 text-xs font-mono text-white/80 overflow-x-auto mb-2'
                )}
                {...rest}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <blockquote className="border-l-4 border-white/30 pl-4 py-2 italic text-white/70 mb-2" {...rest}>{children}</blockquote>;
          },
          u: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <span className="underline decoration-white/60 underline-offset-2" {...rest}>{children}</span>;
          },
          sub: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <sub className="text-[0.75em]" {...rest}>{children}</sub>;
          },
          sup: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <sup className="text-[0.75em]" {...rest}>{children}</sup>;
          },
          // GFM table components — dark-theme styling
          table: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return (
              <div className="overflow-x-auto mb-3 rounded-lg border border-white/10">
                <table className="w-full text-sm border-collapse" {...rest}>{children}</table>
              </div>
            );
          },
          thead: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <thead className="bg-white/10 text-white/90" {...rest}>{children}</thead>;
          },
          tbody: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <tbody className="divide-y divide-white/5" {...rest}>{children}</tbody>;
          },
          tr: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <tr className="border-b border-white/5 last:border-0" {...rest}>{children}</tr>;
          },
          th: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <th className="px-3 py-2 text-left font-semibold text-white/90" {...rest}>{children}</th>;
          },
          td: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <td className="px-3 py-2 text-white/70" {...rest}>{children}</td>;
          },
          // GFM strikethrough
          del: ({ children, ...props }) => {
            const { node, ...rest } = props as any;
            return <del className="line-through text-white/50" {...rest}>{children}</del>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

MathMarkdown.displayName = 'MathMarkdown';
