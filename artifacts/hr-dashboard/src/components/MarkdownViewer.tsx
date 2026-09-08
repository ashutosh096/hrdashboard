import React from 'react';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  // Format line breaks, bold, italic, bullet lists, and numbered lists
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      let formattedLine = line;

      // Handle bullet list
      const isBullet = /^\s*[\-\*•]\s+(.*)/.test(line);
      if (isBullet) {
        formattedLine = line.replace(/^\s*[\-\*•]\s+(.*)/, '$1');
      }

      // Handle numbered list
      const isNumbered = /^\s*\d+\.\s+(.*)/.test(line);
      const numberMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
      if (isNumbered && numberMatch) {
        formattedLine = numberMatch[2];
      }

      // Replace **bold**
      const parts = formattedLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-gray-800 my-0.5 font-medium">
            {parsedParts}
          </li>
        );
      }

      if (isNumbered && numberMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-gray-800 my-0.5 font-medium">
            {parsedParts}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-gray-800 font-medium my-0.5 leading-relaxed">
          {parsedParts}
        </p>
      );
    });
  };

  return <div className={`space-y-0.5 text-sm ${className}`}>{formatMarkdown(content)}</div>;
};
