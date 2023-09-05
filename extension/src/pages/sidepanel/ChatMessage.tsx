import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/ui/codeblock';
import { MemoizedReactMarkdown } from '@/components/markdown';
import { ChatMessageActions } from './ChatMessageActions';
import { Message } from '@/lib/types';

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'group relative mb-4 flex items-start',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
      {...props}
    >
      <div
        className={cn(
          'p-2 rounded-lg space-y-2 overflow-hidden w-5/6 sm:w-2/3',
          message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
        )}
      >
        <MemoizedReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          className='prose prose-sm max-w-none break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0'
          linkTarget='_blank'
          components={{
            th({ children }) {
              return (
                <th
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white'
                  )}
                >
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white'
                  )}
                >
                  {children}
                </td>
              );
            },
            tr({ children }) {
              return (
                <tr
                  className={cn(
                    message.role === 'user'
                      ? 'border-zinc-100'
                      : 'border-zinc-700 dark:border-zinc-300'
                  )}
                >
                  {children}
                </tr>
              );
            },
            thead({ children }) {
              return (
                <thead
                  className={cn(
                    message.role === 'user'
                      ? 'border-zinc-100'
                      : 'border-zinc-700 dark:border-zinc-300'
                  )}
                >
                  {children}
                </thead>
              );
            },
            tbody({ children }) {
              return (
                <tbody
                  className={cn(
                    '',
                    message.role === 'user'
                      ? 'border-zinc-100'
                      : 'border-zinc-700 dark:border-zinc-300'
                  )}
                >
                  {children}
                </tbody>
              );
            },
            h1({ children }) {
              return (
                <h1
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                    'text-xl font-semibold'
                  )}
                >
                  {children}
                </h1>
              );
            },
            h2({ children }) {
              return (
                <h2
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                    'text-lg font-semibold'
                  )}
                >
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                    'text-base font-semibold'
                  )}
                >
                  {children}
                </h3>
              );
            },
            h4({ children }) {
              return (
                <h4
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                    'text-sm font-semibold'
                  )}
                >
                  {children}
                </h4>
              );
            },
            strong({ children }) {
              return (
                <strong
                  className={cn(
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                    'font-semibold'
                  )}
                >
                  {children}
                </strong>
              );
            },
            ul({ children }) {
              return (
                <ul
                  className={cn(
                    message.role === 'user'
                      ? 'text-white marker:text-white'
                      : 'text-zinc-900 marker:text-zinc-900 marker:dark:text-white dark:text-white'
                  )}
                >
                  {children}
                </ul>
              );
            },
            ol({ children }) {
              return (
                <ol
                  className={cn(
                    message.role === 'user'
                      ? 'text-white marker:text-white'
                      : 'text-zinc-900 marker:text-zinc-900 marker:dark:text-white dark:text-white'
                  )}
                >
                  {children}
                </ol>
              );
            },
            p({ children }) {
              return (
                <p
                  className={cn(
                    'mb-4 last:mb-0 text-sm',
                    message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white'
                  )}
                >
                  {children}
                </p>
              );
            },
            code({ inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return <span className='mt-1 cursor-default animate-pulse'>▍</span>;
                }

                children[0] = (children[0] as string).replace('`▍`', '▍');
              }

              const match = /language-(\w+)/.exec(className || '');

              if (inline) {
                return (
                  <code
                    className={cn(
                      className,
                      message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white',
                      'text-sm font-semibold'
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  value={String(children)}
                  language={(match && match[1]) || ''}
                />
              );
            },
          }}
        >
          {message.content || ''}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  );
}
