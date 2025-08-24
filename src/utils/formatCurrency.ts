function formatDate (date: Date | string | null | undefined): string {
   if (!date) {
      return '-';
   }
   const d = new Date(date);
   return isNaN(d.getTime()) ? '-' : d.toISOString().split('T')[0];
}

function formatCurrency (value: number | null | undefined): string {
   if (!value) {
      return 'Rp 0';
   }
   return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
}

export { formatDate, formatCurrency };
