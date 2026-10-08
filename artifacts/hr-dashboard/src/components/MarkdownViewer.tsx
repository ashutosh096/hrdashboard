import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    // Regex matches markdown links [text](url), raw URLs, highlights ==text==, bold **text**, and italic *text*
    const regex = /(\[.*?\]\(.*?\)|https?:\/\/[^\s\)]+|www\.[^\s\)]+|==.*?==|\*\*.*?\*\*|\*.*?\*)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Hyperlink [text](url)
      const mdLinkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (mdLinkMatch) {
        let url = mdLinkMatch[2].trim();
        if (!/^https?:\/\//i.test(url) && (url.includes('.') || url.startsWith('localhost'))) {
          url = `https://${url}`;
        }
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-2 break-all group transition-colors"
          >
            <span>{mdLinkMatch[1] || url}</span>
            <ExternalLink className="w-3 h-3 text-emerald-500 group-hover:text-emerald-700 inline shrink-0" />
          </a>
        );
      }

      // Raw URL
      if (part.startsWith('http://') || part.startsWith('https://') || part.startsWith('www.')) {
        const url = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-2 break-all group transition-colors"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 text-emerald-500 group-hover:text-emerald-700 inline shrink-0" />
          </a>
        );
      }

      // Highlight ==text==
      if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
        return (
          <mark key={idx} className="bg-amber-200 text-amber-950 px-1 py-0.5 rounded font-bold border border-amber-300/60">
            {part.slice(2, -2)}
          </mark>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={idx} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={idx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
      }

      return part;
    });
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 text-xs leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        // Bullet list
        const isBullet = /^\s*[\-\*•]\s+(.*)/.test(line);
        if (isBullet) {
          const textOnly = line.replace(/^\s*[\-\*•]\s+(.*)/, '$1');
          return (
            <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
              <span className="text-emerald-500 font-bold">•</span>
              <span className="text-gray-800 font-medium">{parseInlineFormatting(textOnly)}</span>
            </div>
          );
        }

        // Numbered list
        const numberMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
              <span className="text-emerald-600 font-bold text-[11px]">{numberMatch[1]}.</span>
              <span className="text-gray-800 font-medium">{parseInlineFormatting(numberMatch[2])}</span>
            </div>
          );
        }

        // Empty line
        if (line.trim() === '') {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <p key={idx} className="text-gray-800 font-medium my-0.5 whitespace-pre-wrap">
            {parseInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};
