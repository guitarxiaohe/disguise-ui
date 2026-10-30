import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

/******************************** 日期 ********************************/

const UNIX_SECONDS_LIMIT = 1e11;

function toTimestampMs(value: number) {
  if (!Number.isFinite(value)) return value;
  return Math.abs(value) < UNIX_SECONDS_LIMIT ? value * 1000 : value;
}

function toDateInput(time: Date | number | string) {
  if (typeof time === 'number') return toTimestampMs(time);
  if (typeof time === 'string') {
    const raw = time.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return toTimestampMs(Number(raw));
  }
  return time;
}

/**
 * 按 dayjs 格式输出日期。秒级时间戳会先转成毫秒。
 */
export function formatDate(time?: unknown, format = 'YYYY-MM-DD') {
  if (time === undefined || time === null || time === '') return '';
  if (
    typeof time !== 'number' &&
    typeof time !== 'string' &&
    !(time instanceof Date) &&
    !dayjs.isDayjs(time)
  ) {
    return String(time);
  }

  const date = dayjs.isDayjs(time) ? time : dayjs(toDateInput(time));
  if (!date.isValid()) return String(time ?? '');
  return date.tz().format(format);
}

/**
 * 输出日期时间。
 */
export function formatDateTime(time?: unknown) {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
}

/******************************** 下载 ********************************/

/**
 * 用 Blob 触发浏览器下载。
 */
export function downloadFileFromBlob({
  fileName = 'download',
  source,
}: {
  fileName?: string;
  source: Blob;
}) {
  if (!(source instanceof Blob)) {
    throw new TypeError('Invalid Blob data.');
  }

  const url = URL.createObjectURL(source);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
