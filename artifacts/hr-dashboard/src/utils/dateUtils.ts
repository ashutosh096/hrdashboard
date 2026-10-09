// Indian Standard Time (IST: Asia/Kolkata) Date Utilities
// Strictly outputs Date and Day — NEVER clock hour, minute, second.

export const formatDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    // Format in Indian Standard Time (Asia/Kolkata): Day, D Mon YYYY (e.g. "Thu, 1 Oct 2026")
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Real human-readable Date AND Time formatting for Notifications:
 * e.g. "Oct 9, 2026, 11:03 AM"
 */
export const formatNotificationDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateInput);
  }
};

export const formatDateShortWithTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

export const formatISTDateAndDay = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }); // e.g. "Thursday, 1 Oct 2026"
  } catch {
    return String(dateInput);
  }
};

export const formatTimeIST = (dateInput?: string | Date | null): string => {
  // Returns Day and Date in IST, no clock time
  return formatDateTime(dateInput);
};

export const getKolkataDateString = (d: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d); // Returns YYYY-MM-DD in IST
  } catch {
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const year = ist.getFullYear();
    const month = String(ist.getMonth() + 1).padStart(2, '0');
    const day = String(ist.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

