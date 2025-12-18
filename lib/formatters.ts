
/**
 * Formats a number as a compact currency string in BRL.
 * Examples:
 * 1600 -> R$ 1.6 mil
 * 500000 -> R$ 500 mil
 * 1200000 -> R$ 1.2 mi
 */
export function formatCompactCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue < 1000) {
    return sign + new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(absValue);
  }
  
  if (absValue < 1000000) {
    const formatted = (absValue / 1000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0
    });
    return `${sign}R$ ${formatted} mil`;
  }
  
  const formatted = (absValue / 1000000).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0
  });
  return `${sign}R$ ${formatted} mi`;
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
