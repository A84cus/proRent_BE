declare module 'node-xlsx' {
   export interface WorkSheetOptions {
      /** apakah sheet ini hidden */
      hidden?: boolean;
   }

   export interface WorkSheet {
      /** nama sheet */
      name: string;
      /** data 2D array (baris × kolom) */
      data: (string | number | Date | null | undefined)[][];
      /** opsi tambahan */
      options?: WorkSheetOptions;
   }

   export interface BuildOptions {
      /** jenis format output, default 'buffer' */
      type?: 'buffer' | 'array';
      /** apakah auto menambahkan cell styles */
      cellStyles?: boolean;
      /** password proteksi workbook (jika didukung) */
      password?: string;
   }

   export interface ParseOptions {
      /** sheet yang di-parse, default semua */
      sheet?: number | string;
      /** opsi 'raw' */
      raw?: boolean;
      /** opsi 'cellDates' untuk konversi excel dates ke JS Date */
      cellDates?: boolean;
   }

   export interface ParsedWorkSheet {
      name: string;
      data: any[][];
   }

   /** membangun excel dari sheets */
   export function build(sheets: WorkSheet[], options?: BuildOptions): Buffer | any[];

   /** parse excel dari file path atau Buffer */
   export function parse(file: string | Buffer, options?: ParseOptions): ParsedWorkSheet[];
}
