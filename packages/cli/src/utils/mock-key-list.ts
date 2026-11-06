/**
 * The expression a generated MSW handler reads a batch request's key list with, from the query
 * parameter `name`, inside a resolver that destructures `request`.
 *
 * A client writes an array parameter either once, its members joined by commas (`String(array)`),
 * or once per member, so both forms are read. An empty member is dropped: a request for an empty
 * list arrives as `name=`, and a mock store that matches a string key against a numeric one reads
 * `""` as the number 0.
 */
export function queryKeyListRead(name: string): string {
  return (
    `new URL(request.url).searchParams.getAll(${JSON.stringify(name)})` +
    '.flatMap((value) => value.split(",")).filter((key) => key !== "")'
  );
}
