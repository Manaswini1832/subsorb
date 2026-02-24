export default function isStale(updated_at) {
  if (!updated_at) return true;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return new Date(updated_at) < sixMonthsAgo;
}