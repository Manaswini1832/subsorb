export default function isStale(
  updated_at: string | Date | null | undefined,
): boolean {
  if (!updated_at) return true;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return new Date(updated_at) < sixMonthsAgo;
}
