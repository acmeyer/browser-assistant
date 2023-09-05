import { Button } from '@/components/ui/button';
import { CheckIcon, ClipboardIcon } from '@radix-ui/react-icons';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message;
}

export function ChatMessageActions({ message, className, ...props }: ChatMessageActionsProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    if (!message.content) return;
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button
        variant='none'
        size='icon_sm'
        onClick={onCopy}
        className={message.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white'}
      >
        {isCopied ? <CheckIcon /> : <ClipboardIcon />}
        <span className='sr-only'>Copy message</span>
      </Button>
    </div>
  );
}
