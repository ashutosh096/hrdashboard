export const formatDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateStr} at ${timeStr}`;
  } catch {
    return String(dateInput);
  }
};

export const formatDateShortWithTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateStr}, ${timeStr}`;
  } catch {
    return String(dateInput);
  }
};
