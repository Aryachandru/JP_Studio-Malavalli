import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jpstudio.app',
  appName: 'jpstudio-app',
  webDir: 'build',
  server: {
    url: 'https://jp-studio-6281.web.app',
    cleartext: true
  }
};


export default config;
