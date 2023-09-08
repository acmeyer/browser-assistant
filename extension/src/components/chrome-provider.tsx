import { createContext, useContext, useEffect, useState } from 'react';
import { PageContent } from '@/lib/types';
import { getPageContent } from '@/lib/reader';

export type ChromeProviderProps = {
  children: React.ReactNode;
};

type ChromeProviderState = {
  currentUrl?: string;
  selectedText?: string;
  activeTab?: chrome.tabs.Tab;
  getPageContent: () => Promise<PageContent | undefined>;
  injectScript: (func: string) => Promise<void>;
};

const initialState: ChromeProviderState = {
  getPageContent: async () => undefined,
  injectScript: async () => undefined,
};

const ChromeProviderContext = createContext<ChromeProviderState>(initialState);

export function ChromeProvider({ children }: ChromeProviderProps) {
  const [url, setUrl] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | undefined>();

  useEffect(() => {
    // On initial load, set the url
    setActiveTabUrl();

    chrome.runtime.onMessage.addListener(
      (request, sender: chrome.runtime.MessageSender, sendResponse) => {
        if (request.action === 'pageLoaded') {
          sendResponse();
          setUrl(sender.url);
          return true;
        }
      }
    );

    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        setActiveTab(tab);
        if (tab.url) {
          setUrl(tab.url);
        }
      });
    });

    return () => {
      chrome.runtime.onMessage.removeListener(() => true);
      chrome.tabs.onActivated.removeListener(() => null);
    };
  }, []);

  const setActiveTabUrl = () => {
    chrome.tabs.query(
      { active: true, currentWindow: true, status: 'complete', windowType: 'normal' },
      (tabs) => {
        const activeTab = tabs[0];
        setActiveTab(activeTab);
        setUrl(activeTab?.url);
      }
    );
  };

  const getContent = async (): Promise<PageContent> => {
    const content = await chrome.scripting.executeScript({
      target: { tabId: activeTab?.id || 0 },
      func: getPageContent,
    });
    return content[0]?.result;
  };

  const injectScript = async (func: string) => {
    chrome.scripting.executeScript({
      target: { tabId: activeTab?.id || 0 },
      func: eval(func),
    });
    return;
  };

  return (
    <ChromeProviderContext.Provider
      value={{
        currentUrl: url,
        activeTab,
        getPageContent: getContent,
        injectScript,
      }}
    >
      {children}
    </ChromeProviderContext.Provider>
  );
}

export const useChrome = () => {
  const context = useContext(ChromeProviderContext);

  if (context === undefined)
    throw new Error('useChrome must be used within a ChromeProviderContext');

  return context;
};
