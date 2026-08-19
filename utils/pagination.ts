export interface PaginationPage<T> {
  items: T[];
  total: number;
}

export async function collectAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PaginationPage<T>>,
  pageSize = 100,
): Promise<T[]> {
  const collected: T[] = [];

  for (let page = 1; ; page += 1) {
    const result = await fetchPage(page, pageSize);
    collected.push(...result.items);

    if (result.items.length === 0 || collected.length >= result.total) {
      return collected;
    }
  }
}
