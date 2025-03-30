import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'Rawdah.Company.remoapp', // Unique ID for your app
  appName: 'Remo_app',            // Display name of the app
  webDir: 'build',                // Directory of your React build
  server: {
    url: 'http://your-hosted-server.com', // Replace with your deployed server URL
    cleartext: true                     // Allow HTTP (for testing; use HTTPS in production)
  }
};

export default config;
