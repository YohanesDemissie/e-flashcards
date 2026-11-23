export function formatCreatedDate(value: string) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ];

  const [year, month, day] = value.slice(0, 10).split("-");

  return `${monthNames[Number(month) - 1]} ${Number(day)}, ${year}`;
}