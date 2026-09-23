// .storybook/preview.tsx
/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { handlers } from '../src/test/handlers';
import '../src/styles/global.css';

const preview: Preview = {
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker(...handlers);
      await worker.start({ onUnhandledRequest: 'bypass' });
      return worker;
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - muestra violaciones de a11y solo en el panel de test
      // 'error' - falla CI ante violaciones de a11y
      // 'off' - desactiva los chequeos de a11y
      test: 'todo',
    },
  },
  decorators: [
    (Story) => React.createElement(MemoryRouter, null, React.createElement(Story)),
  ],
};

export default preview;