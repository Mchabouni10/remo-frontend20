
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'Rawdah.Company.remoapp', // Unique ID, looks good
  appName: 'Remo App',             // Updated for consistency and readability
  webDir: 'build',                 // Matches your React build directory
  server: {
    url: 'https://remo-backend-91sw.onrender.com', // Your deployed backend URL
    cleartext: false                     // HTTPS, so no need for cleartext
  },
  android: {
    allowMixedContent: false            // Enforce HTTPS-only for security
  }
};

export default config;
