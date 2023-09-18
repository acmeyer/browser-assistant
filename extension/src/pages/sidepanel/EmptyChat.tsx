import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { type ChatProviderState } from '@/components/chat-provider';

const exampleMessages = [
  {
    heading: 'Explain a concepts',
    message: `What is this web page about?`,
  },
  {
    heading: 'Summarize the current web page',
    message: 'Can you summarize the page I am currently on?',
  },
  {
    heading: 'Add content to a page',
    message: `Can you add a button to this page that says "Click me"?`,
  },
  {
    heading: 'Restyle a page',
    message: 'Can you update this page to use a dark theme?',
  },
];

export function EmptyChat({ setInput }: Pick<ChatProviderState, 'setInput'>) {
  return (
    <div className='mx-auto w-full'>
      <h1 className='mb-2 text-lg font-semibold'>Welcome to Browser Assistant!</h1>
      <p className='leading-normal text-zinc-500 dark:text-zinc-400'>
        You can start a conversation below or try the following examples:
      </p>
      <div className='mt-4 flex flex-col items-start space-y-2'>
        {exampleMessages.map((message, index) => (
          <Button
            key={index}
            variant='link'
            className='h-auto p-0 text-base'
            onClick={() => setInput(message.message)}
          >
            <ArrowRightIcon className='mr-2 text-zinc-500 dark:text-zinc-400' />
            {message.heading}
          </Button>
        ))}
      </div>
    </div>
  );
}
