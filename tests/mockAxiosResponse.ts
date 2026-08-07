// tests/mockAxiosResponse.ts
import type { AxiosResponse } from 'axios';

// vi.mocked(...).mockResolvedValue() requires a value structurally matching
// the mocked function's REAL return type — for anything calling postForm/
// patchForm/api.post/api.patch/api.get, that's a full AxiosResponse, not
// just { data }. Nothing in the code under test ever reads status/
// statusText/headers/config, so this fills `data` for real and the rest
// with placeholders via one explicit, scoped cast — instead of every test
// file hand-building a slightly different fake AxiosResponse shape.
export function mockAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  } as unknown as AxiosResponse<T>;
}
