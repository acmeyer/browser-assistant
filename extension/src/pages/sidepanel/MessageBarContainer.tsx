import { ButtonScrollToBottom } from '@pages/sidepanel/ButtonScrollToBottom';
import { MessageInput } from '@pages/sidepanel/MessageInput';
import { PageContent } from '@/lib/types';

type MessageBarContainerProps = {
  chatBodyRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  isAssistantResponding: boolean;
  input: string;
  setInput: (input: string) => void;
  addMessage: (message: string, options?: object) => Promise<void>;
  getPageContent: () => Promise<PageContent | undefined>;
  currentUrl?: string;
};

export const MessageBarContainer = ({
  chatBodyRef,
  bottomRef,
  isAssistantResponding,
  isLoading,
  input,
  setInput,
  addMessage,
  currentUrl,
  getPageContent,
}: MessageBarContainerProps) => {
  return (
    <div className='fixed inset-x-0 bottom-0'>
      <div className='mx-auto sm:max-w-5xl sm:px-4'>
        <ButtonScrollToBottom bodyRef={chatBodyRef} bottomRef={bottomRef} />
        <div className='space-y-4 border-t dark:border-zinc-800 dark:bg-zinc-900 bg-white px-4 py-2 shadow-lg sm:rounded-xl sm:border sm:mb-3'>
          <MessageInput
            onSubmit={async (value) => {
              const pageContent = await getPageContent();
              await addMessage(value, { url: currentUrl, pageContent });
            }}
            input={input}
            setInput={setInput}
            isLoading={isAssistantResponding || isLoading}
          />
        </div>
      </div>
    </div>
  );
};
