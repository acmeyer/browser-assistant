import { PlusIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useChat } from '@/components/chat-provider';

const Header = () => {
  const { startNewConversation } = useChat();

  return (
    <header className='mx-auto px-4 fixed top-0 right-0 left-0 z-50 w-full border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 border-gray-200'>
      <div className='flex h-10 items-center justify-between'>
        <h1 className='scroll-m-20 text-base font-semibold'>Chat</h1>
        <div className='flex flex-row'>
          <Button variant='none' size='icon_sm' onClick={startNewConversation}>
            <PlusIcon />
            <span className='sr-only'>Start new chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
