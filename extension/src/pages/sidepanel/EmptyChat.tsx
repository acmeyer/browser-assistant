import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { type ChatProviderState } from '@/components/chat-provider';

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`,
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n',
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`,
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
