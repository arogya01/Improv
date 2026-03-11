/// <reference types="vite/client" />

import { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string;
        inline?: boolean;
      };
    }
  }
}
