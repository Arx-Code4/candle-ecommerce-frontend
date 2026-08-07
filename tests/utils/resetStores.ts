// tests/utils/resetStores.ts
// Per Frontend Testing Guide, Section 5.3 — build once, register every
// store's reset call here, then import this file from tests/setup.ts
// so it runs globally and individual test files never need to remember
// to reset stores manually.
//
// ASSUMPTION FLAGGED: this project's auth store (src/store/auth.store.ts)
// does not yet export a `resetAuthStore` helper — the base template's
// version doesn't ship one. Per the guide's own pattern (Section 5.3),
// add this alongside the store itself:
//
//   export const resetAuthStore = () =>
//     useAuthStore.setState(useAuthStore.getInitialState());
//
// None of this ticket's 9 assigned test files touch auth state directly,
// so this file is not exercised by them yet — it's included now because
// the guide directs shared infra to be built once, up front, and the
// import below establishes the pattern the next store-touching test
// (e.g. AdminRoute, ProtectedRoute) will rely on.
import { afterEach } from 'vitest';
import { resetAuthStore } from '@/store/auth.store';

afterEach(() => {
  resetAuthStore();
  // Register each additional store's reset call here as stores are added.
});
