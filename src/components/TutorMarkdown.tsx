import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TutorMarkdownProps {
  content: string;
  className?: string;
}

export function TutorMarkdown({ content, className }: TutorMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
