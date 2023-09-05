import { cn } from '@/lib/utils';
import { useAtBottom } from '@/lib/hooks/use-at-bottom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ArrowDownIcon } from '@radix-ui/react-icons';

interface ButtonScrollToBottomProps extends ButtonProps {
  bodyRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
}

export function ButtonScrollToBottom({
  bodyRef,
  bottomRef,
  className,
  ...props
}: ButtonScrollToBottomProps) {
  const isAtBottom = useAtBottom(bodyRef, 100);

  return (
    <div className='flex items-center justify-end mb-2 px-4'>
      <Button
        variant='outline'
        size='icon'
        className={cn(
          'z-40 bg-white dark:bg-zinc-900',
          isAtBottom ? 'opacity-0' : 'opacity-100',
          className
        )}
        onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
        {...props}
      >
        <ArrowDownIcon />
        <span className='sr-only'>Scroll to bottom</span>
      </Button>
    </div>
  );
}
