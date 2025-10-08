const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatChatTime = (isoString: string): string  => {
  const date = new Date(isoString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return formatTime(isoString);
  } else if (isYesterday) {
    return `Yesterday ${formatTime(isoString)}`;
  } else {
    return formatDateTime(isoString);
  }
};
