// mobile-frontend/src/utils/formatters.js

export const formatCurrency = (value, currency = "USD", locale = "en-US") => {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(safe);
};

export const formatDate = (date, locale = "en-US", options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString(locale, {
    ...defaultOptions,
    ...options,
  });
};

export const truncateText = (text, maxLength) => {
  if (text == null) return "";
  const str = String(text);
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substr(0, maxLength)}...`;
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};
