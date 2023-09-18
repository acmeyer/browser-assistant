import pkg from '../package.json';

const manifest = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_title: 'Open Side Panel',
  },
  side_panel: {
    default_path: 'src/pages/sidepanel/index.html',
  },
  icons: {
    '128': 'icon-128.png',
  },
  permissions: ['activeTab', 'tabs', 'sidePanel', 'contextMenus', 'scripting'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/content/index.js'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['icon-128.png', 'icon-34.png'],
      matches: [],
    },
    {
      resources: ['src/lib/bootstrap.js'],
      matches: ['<all_urls>'],
    },
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+Shift+S',
        mac: 'Command+Shift+S',
      },
    },
  },
};

export default manifest;
