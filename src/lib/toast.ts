export const toast = {
  success: (message: string): void => {
    // Placeholder — no toast library has been chosen yet; flagged for
    // reviewers (see PR description). Swap this for whatever's decided
    // (sonner, react-hot-toast, etc.) without needing to touch call sites.
    console.log('[toast:success]', message);
  },
};
