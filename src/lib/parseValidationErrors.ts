// Backend validation failures (from the shared zod validate() middleware)
// arrive as { message: 'Validation failed', errors: string[] }, where each
// string is "body.price: Expected number, received string" — a path and a
// message glued together, not a structured { field, message } object.
// This parses that shape into something react-hook-form's setError() can
// use per-field. Built now (not deferred like RegisterPage's version)
// because admin product forms have far more fields — price, variants,
// photos — where a single generic root error is a meaningfully worse
// experience than it was for Register's three fields.
export interface ParsedFieldError {
  field: string;
  message: string;
}

export function parseValidationErrors(errors: string[]): ParsedFieldError[] {
  return errors.map((raw) => {
    const separatorIndex = raw.indexOf(': ');

    if (separatorIndex === -1) {
      // No recognizable "path: message" shape — surface it as a form-level
      // error rather than silently dropping it. field: '' is the
      // react-hook-form convention for "attach to the form root".
      return { field: '', message: raw };
    }

    const rawPath = raw.slice(0, separatorIndex);
    const message = raw.slice(separatorIndex + 2);

    // Strip the "body." prefix the middleware adds (it validates
    // { body, params, query } as one object) — react-hook-form's field
    // names match the form's own field names ("price"), not the
    // backend's internal validation path ("body.price").
    const field = rawPath.startsWith('body.') ? rawPath.slice(5) : rawPath;

    return { field, message };
  });
}
