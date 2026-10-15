export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request fields');
  return result.data;
}
