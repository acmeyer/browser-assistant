/* eslint-disable no-case-declarations */
import { Message } from '@/lib/types';
import { FUNCTION_NAMES } from '@/lib/constants';
import { Spinner } from '@/components/ui/spinner';
import { CheckIcon } from '@radix-ui/react-icons';

export interface ChatFunctionCallProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatFunctionCall({ message, isLoading = true, ...props }: ChatFunctionCallProps) {
  const getFunctionMessageForName = () => {
    const functionName = message?.function_call?.name || message?.name || '';

    switch (functionName) {
      case FUNCTION_NAMES.INJECT_SCRIPT:
        return isLoading ? 'Modifying the page...' : 'Finished modifying the page.';
      case FUNCTION_NAMES.READ:
        return isLoading ? 'Reading the page...' : 'Finished reading the page.';
      case FUNCTION_NAMES.SUMMARIZE:
        return isLoading ? 'Generating a summary...' : 'Generated a summary.';
      case FUNCTION_NAMES.NOTES:
        let actionType = '';
        try {
          const args = JSON.parse(message.function_call?.arguments || '');
          actionType = args?.action || '';
        } catch (err) {
          // Ignore failing
        }

        switch (actionType) {
          case 'create':
            return isLoading ? 'Creating a new note...' : 'Created a new note.';
          case 'get':
            return isLoading ? 'Searching for note...' : 'Finished searching for note.';
          default:
            return isLoading ? 'Getting notes...' : 'Finished with notes.';
        }
      default:
        return isLoading ? 'Loading...' : 'Finished.';
    }
  };

  return (
    <div className={'group relative mb-4 flex items-start justify-start'} {...props}>
      <div className={'flex items-center flex-row overflow-hidden w-5/6 sm:w-2/3'}>
        <>
          {isLoading ? <Spinner /> : <CheckIcon className='text-green-600 mr-1' />}
          <div>{getFunctionMessageForName()}</div>
        </>
      </div>
    </div>
  );
}
