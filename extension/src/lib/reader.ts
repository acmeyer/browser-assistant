import { PageContent } from '@/lib/types';

export const getPageContent = () => {
  const getPageMeta = () => {
    const meta = {};
    let cnt = 0;

    function processMetaElement(element: Element) {
      const name = element.getAttribute('name');
      const property = element.getAttribute('property');
      const content = element.getAttribute('content');

      const meta: { [key: string]: string } = {};

      if (content) {
        if (property) {
          if (property.startsWith('og:image')) {
            return true;
          }
          if (property.startsWith('og:')) {
            meta[property] = content;
            cnt += 1;
            return true;
          }
        }
        if (name) {
          if (name.startsWith('article:')) {
            meta[name] = content;
            cnt += 1;
            return true;
          }
          if (name.startsWith('description')) {
            meta[name] = content;
            cnt += 1;
            return true;
          }
        }
      }

      return false;
    }

    const metaElements = document.querySelectorAll('meta');
    for (let i = 0; i < metaElements.length; i++) {
      processMetaElement(metaElements[i]);
      if (cnt > 10) {
        break;
      }
    }

    return meta;
  };

  const getCustomContent = () => {
    const customContent: PageContent = {
      title: document.title,
      ...getPageMeta(),
      content: document.body.innerHTML,
      textContent: document.body.innerText,
    };

    const regex = /github\.com\/(?:[\w-]+\/)*blob\//;
    if (regex.test(window.location.href)) {
      customContent.code = document.querySelector('#read-only-cursor-text-area')?.nodeValue;
    }

    return customContent;
  };

  const customContent = getCustomContent();
  return customContent;
};
