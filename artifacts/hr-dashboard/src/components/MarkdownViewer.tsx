import React from 'react';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    // Regex matches markdown links [text](url), raw URLs, highlights ==text==, bold **text**, and italic *text*
    const regex = /(\[.*?\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s\)]+|==.*?==|\*\*.*?\*\*|\*.*?\*)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      // Hyperlink [text](url)
      const mdLinkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (mdLinkMatch) {
        return (
          <a
            key={idx}
            href={mdLinkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-bold underline hover:text-emerald-700 break-all"
          >
            {mdLinkMatch[1]}
          </a>
        );
      }

      // Raw URL
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-bold underline hover:text-emerald-700 break-all"
          >
            {part}
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
