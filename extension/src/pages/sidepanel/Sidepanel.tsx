import Chat from './Chat';
import { ChatProvider } from '@/components/chat-provider';
import { ChromeProvider } from '@/components/chrome-provider';
import Header from './Header';

export default function Sidepanel(): JSX.Element {
  return (
    <ChromeProvider>
      <ChatProvider>
        <div className='absolute top-0 left-0 right-0 bottom-0 h-full'>
          <Header />
          <Chat />
        </div>
      </ChatProvider>
    </ChromeProvider>
  );
}
