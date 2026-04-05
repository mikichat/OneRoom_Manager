export function useFormatters() {
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₩0';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return { formatCurrency, formatDate, formatDateShort };
}
