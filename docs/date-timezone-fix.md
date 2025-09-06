# Date Timezone Fix Documentation

## Problem

Ketika frontend mengirim payload dengan tanggal `"2025-09-02"`, tanggal yang tersimpan di database menjadi `2025-09-01 17:00:00.000`, yaitu berkurang 1 hari.

## Root Cause

Masalah terjadi karena timezone conversion saat JavaScript mem-parse string tanggal:

```javascript
// ❌ MASALAH: JavaScript akan menginterpretasi ini sebagai UTC midnight
const date = new Date("2025-09-02"); // -> 2025-09-02 00:00:00 UTC

// Ketika ditampilkan di timezone lokal (UTC+7), akan menjadi:
// 2025-09-01 17:00:00.000 (mundur 7 jam)
```

## Solution Applied

Mengubah parsing tanggal di `flexibleAvailabilityService.ts` untuk menghindari timezone conversion:

### Before (❌ Bermasalah):

```typescript
const date = new Date(item.date); // UTC conversion
date.setHours(0, 0, 0, 0); // Tetap bermasalah karena sudah di-convert ke UTC
```

### After (✅ Fixed):

```typescript
// Parse date string manually to avoid timezone issues
const dateStr = item.date;
const [year, month, day] = dateStr.split("-").map(Number);

// Create date in local timezone (no UTC conversion)
const date = new Date(year, month - 1, day, 0, 0, 0, 0);
```

## How It Works

### 1. Manual Parsing

- Split string `"2025-09-02"` menjadi `[2025, 9, 2]`
- Parse setiap bagian menjadi number

### 2. Local Date Creation

- `new Date(year, month-1, day, 0, 0, 0, 0)` membuat date object di timezone lokal
- Tidak ada konversi UTC yang menyebabkan shift tanggal

### 3. Database Storage

- Date object yang benar langsung disimpan ke database
- Tanggal tetap konsisten dengan input frontend

## Test Cases

### Input dari Frontend:

```json
{
  "availability": [{ "date": "2025-09-02", "isAvailable": false }]
}
```

### Expected Database Result:

```sql
-- Sebelum fix:
date: 2025-09-01 17:00:00.000 ❌

-- Setelah fix:
date: 2025-09-02 00:00:00.000 ✅
```

## Files Modified

- `/src/service/property/flexibleAvailabilityService.ts`
  - Method: `validateAndParseDates()`
  - Changed: Date parsing logic

## Testing

Untuk memverifikasi fix:

1. **Test dengan curl:**

```bash
curl -X POST http://localhost:5000/api/rooms/{room-id}/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "availability": [
      {"date": "2025-09-02", "isAvailable": false}
    ]
  }'
```

2. **Check database:**

```sql
SELECT date, availableCount FROM availability
WHERE date = '2025-09-02';
```

3. **Expected result:**

- Tanggal harus exactly `2025-09-02` tanpa shift ke hari sebelumnya

## Additional Notes

- Fix ini juga mengatasi masalah untuk semua timezone
- Tidak mempengaruhi logic lain karena hanya mengubah cara parsing tanggal
- Date validation tetap berfungsi dengan error message yang jelas
