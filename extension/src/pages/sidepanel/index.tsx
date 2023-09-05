import { createRoot } from 'react-dom/client';
import '@assets/styles/tailwind.css';
import Sidepanel from '@pages/sidepanel/Sidepanel';

window.addEventListener('load', () => {
  chrome.runtime.sendMessage({ action: 'sidePanelReady' });
});

const init = () => {
  const rootContainer = document.querySelector('#__root');
  if (!rootContainer) throw new Error("Can't find Sidepanel root element");
  const root = createRoot(rootContainer);
  root.render(<Sidepanel />);
};

init();
