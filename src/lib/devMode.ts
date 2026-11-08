// v9: Test Tools are a BUILD-TIME switch (see vite.config.ts, env VITE_ENABLE_TEST_TOOLS, default "true" for the
// Render test build). When the flag is false, __GE_TEST_TOOLS__ is the literal `false`, so every gated branch,
// the Test Tools panel and engine/testTools.ts are tree-shaken out. There is deliberately NO URL param or
// localStorage toggle.
declare const __GE_TEST_TOOLS__: boolean;
export const TEST_TOOLS: boolean = typeof __GE_TEST_TOOLS__ !== "undefined" && __GE_TEST_TOOLS__ === true;
export function isDevMode(): boolean {
  return TEST_TOOLS;
}
