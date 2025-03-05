import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeExampleProps {
  language: string;
  code: string;
}

export default function CodeExample({ language, code }: CodeExampleProps) {
  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: '0.375rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}