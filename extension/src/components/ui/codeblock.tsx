import { memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';
import { CheckIcon, ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

interface languageMap {
  [key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
  jsx: '.jsx',
  tsx: '.tsx',
  javascript: '.js',
  python: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  'c++': '.cpp',
  'c#': '.cs',
  ruby: '.rb',
  php: '.php',
  swift: '.swift',
  'objective-c': '.m',
  kotlin: '.kt',
  typescript: '.ts',
  go: '.go',
  perl: '.pl',
  rust: '.rs',
  scala: '.scala',
  haskell: '.hs',
  lua: '.lua',
  shell: '.sh',
  sql: '.sql',
  html: '.html',
  css: '.css',
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'; // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return lowercase ? result.toLowerCase() : result;
};

const CodeBlock = memo(({ language, value }: CodeBlockProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const fileExtension = programmingLanguages[language] || '.file';
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`;
    const fileName = window.prompt('Enter file name' || '', suggestedFileName);

    if (!fileName) {
      // User pressed cancel on prompt.
      return;
    }

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(value);
  };

  return (
    <div className='relative w-full font-sans codeblock bg-zinc-950 rounded-md'>
      <div className='flex items-center justify-between w-full px-4 py-2 bg-zinc-800 text-zinc-300 rounded-t-md'>
        <span className='text-xs lowercase'>{language}</span>
        <div className='flex items-center space-x-1'>
          <Button
            variant='none'
            className='text-zinc-300 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 h-4 w-4 hover:bg-transparent hover:text-zinc-500 mx-2'
            onClick={downloadAsFile}
            size='icon_sm'
          >
            <DownloadIcon />
            <span className='sr-only'>Download</span>
          </Button>
          <Button
            variant='none'
            size='icon_sm'
            className='text-zinc-300 text-xs focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 h-4 w-4 hover:bg-transparent hover:text-zinc-500 mx-2'
            onClick={onCopy}
          >
            {isCopied ? <CheckIcon /> : <ClipboardIcon />}
            <span className='sr-only'>Copy code</span>
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag='div'
        showLineNumbers={false}
        customStyle={{
          margin: 0,
          width: '100%',
          background: 'transparent',
          padding: '1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
