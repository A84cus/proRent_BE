"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatCurrency = formatCurrency;
function formatDate(date) {
    if (!date) {
        return '-';
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? '-' : d.toISOString().split('T')[0];
}
function formatCurrency(value) {
    if (!value) {
        return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
}
