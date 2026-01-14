import type {} from "hono";
import type { Env as AppEnv, Variables as AppVariables } from "./types/env";

declare module "hono" {
  interface Env {
    Variables: AppVariables;
    Bindings: AppEnv;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    "lord-icon": {
      src: string;
      trigger?:
        | "hover"
        | "click"
        | "loop"
        | "loop-on-hover"
        | "morph"
        | "boomerang"
        | "in"
        | "sequence";
      colors?: string;
      stroke?: "light" | "regular" | "bold";
      state?: string;
      target?: string;
      style?: string | Record<string, string>;
      class?: string;
    };
  }
}
