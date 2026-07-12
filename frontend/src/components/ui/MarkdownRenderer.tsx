/**
 * Simple markdown renderer for executive reports and chat responses.
 * Supports: h1-h3, hr, bold, lists, paragraphs.
 */

import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-[#dae2fd]">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${key++}`} className="list-disc pl-5 space-y-1 my-2">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm text-[#dae2fd] leading-relaxed">{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed === '---') {
      flushList();
      elements.push(<hr key={`hr-${key++}`} className="border-white/10 my-4" />);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${key++}`} className="text-xl sm:text-2xl font-bold text-[#dae2fd] mt-2 mb-3">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${key++}`} className="text-lg sm:text-xl font-semibold text-[#dae2fd] mt-4 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${key++}`} className="text-base font-semibold text-violet-300 mt-3 mb-1">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)/);
    if (ordered) {
      listItems.push(ordered[1]);
      continue;
    }

    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      flushList();
      elements.push(
        <p key={`em-${key++}`} className="text-xs text-[#958ea0] italic mt-4">{trimmed.slice(1, -1)}</p>
      );
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-sm sm:text-base text-[#dae2fd] leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
