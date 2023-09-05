import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/components/chat-provider';
import { useChrome } from '@/components/chrome-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyChat } from './EmptyChat';
import { MessageBarContainer } from './MessageBarContainer';
import { ChatMessage } from './ChatMessage';
import { ChatFunctionCall } from './ChatFunctionCall';
import { Conversation } from '@/lib/types';

const Chat = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const {
    conversation: serverConversation,
    isLoading,
    isAssistantResponding,
    setInput,
    input,
    addMessage,
  } = useChat();
  const { currentUrl, getPageContent } = useChrome();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null | undefined>(
    serverConversation
  );
  let skipNext = false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  useEffect(() => {
    setCurrentConversation(serverConversation);
  }, [serverConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [currentConversation?.messages]);

  return (
    <div ref={chatBodyRef}>
      <div
        className={'pb-24 sm:pb-28 pt-14 px-4 flex flex-col-reverse min-h-screen mx-auto max-w-5xl'}
      >
        {isLoading ? (
          <div className='flex flex-col w-full space-x-4 space-y-4'>
            <div className='flex justify-end'>
              <Skeleton className='h-24 w-5/6 sm:w-2/3' />
            </div>
            <div className='flex justify-start'>
              <Skeleton className='h-24 w-5/6 sm:w-2/3' />
            </div>
            <div className='flex justify-end'>
              <Skeleton className='h-24 w-5/6 sm:w-2/3' />
            </div>
            <div className='flex justify-start'>
              <Skeleton className='h-24 w-5/6 sm:w-2/3' />
            </div>
          </div>
        ) : currentConversation?.messages?.length ? (
          currentConversation?.messages?.reduce((acc, message) => {
            if (skipNext) {
              skipNext = false;
              return acc;
            }

            if (message.function_call) {
              acc.push(<ChatFunctionCall key={message.id} message={message} />);
            } else if (message.role === 'function') {
              skipNext = true;
              acc.push(<ChatFunctionCall key={message.id} message={message} isLoading={false} />);
            } else {
              acc.push(<ChatMessage key={message.id} message={message} />);
            }
            return acc;
          }, [] as React.ReactNode[])
        ) : (
          <EmptyChat setInput={setInput} />
        )}
      </div>
      <div ref={bottomRef} />
      <MessageBarContainer
        chatBodyRef={chatBodyRef}
        bottomRef={bottomRef}
        isLoading={isLoading}
        isAssistantResponding={isAssistantResponding}
        addMessage={addMessage}
        input={input}
        setInput={setInput}
        currentUrl={currentUrl}
        getPageContent={getPageContent}
      />
    </div>
  );
};

export default Chat;
