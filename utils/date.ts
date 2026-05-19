export const TIME_ZONE = 'Asia/Jakarta';

/**
 * Memformat tanggal ke string lokal WIB
 */
export const formatToWIB = (date: Date | string | number) => {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(date));
};

/**
 * Mendapatkan objek Date untuk awal hari di WIB
 */
export const getStartOfTodayWIB = () => {
  const now = new Date();
  const wibDateString = now.toLocaleString('en-US', { timeZone: TIME_ZONE });
  const wibDate = new Date(wibDateString);
  wibDate.setHours(0, 0, 0, 0);
  return wibDate;
};
