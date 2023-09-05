import { useEffect, useRef } from 'react';
import Textarea from 'react-textarea-autosize';

import { Button } from '@/components/ui/button';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { ChatProviderState } from '@/components/chat-provider';

export interface MessageInputProps
  extends Pick<ChatProviderState, 'input' | 'setInput' | 'isLoading'> {
  onSubmit: (value: string) => Promise<void>;
}

export function MessageInput({ onSubmit, isLoading, input, setInput }: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const submitMessage = (): void => {
    if (isLoading || !input || !input.trim()) {
      return;
    }

    setInput('');
    onSubmit(input);
  };

  return (
    <div className='relative flex max-h-60 w-full grow flex-col overflow-hidden pr-10'>
      <Textarea
        ref={inputRef}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.shiftKey === false && !event.nativeEvent.isComposing) {
            submitMessage();
            event.preventDefault();
          }
        }}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Send a message.'
        spellCheck={false}
        className='w-full resize-none bg-transparent py-2 focus-within:outline-none sm:text-sm'
      />
      <div className='absolute right-0 bottom-0'>
        <Button
          type='button'
          onClick={() => submitMessage()}
          size='icon'
          disabled={isLoading || input === ''}
          className='cursor-pointer disabled:cursor-not-allowed'
        >
          <PaperPlaneIcon />
          <span className='sr-only'>Send message</span>
        </Button>
      </div>
    </div>
  );
}
