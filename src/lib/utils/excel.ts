import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

interface ExcelColumnConfig {
    key: string;
    header: string;
    width?: number;
    type?: 'string' | 'number' | 'date';
}

export function generateColumnsFromData(data: Record<string, unknown>[]): ExcelColumnConfig[] {
    if (!data || data.length === 0) return [];

    const sampleRow = data[0];
    const columns: ExcelColumnConfig[] = [];

    Object.keys(sampleRow).forEach((key) => {
        const header = key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        columns.push({
            key,
            header,
            width: 15,
            type: 'string',
        });
    });

    return columns;
}

export async function generateExcelBuffer(
    data: Record<string, unknown>[],
    columns: ExcelColumnConfig[],
    sheetName = 'Data'
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
    }));

    data.forEach((item) => {
        const row: Record<string, unknown> = {};

        columns.forEach((col) => {
            let value = item[col.key];

            if (col.type === 'date' && value) {
                value = dayjs(value as string).format('YYYY-MM-DD HH:mm:ss');
            }

            if (col.type === 'number' && value !== null && value !== undefined) {
                value = Number(value);
            }

            row[col.key] = value ?? '';
        });

        worksheet.addRow(row);
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E79' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

export function generateExcelFilename(type: string, filters?: Record<string, unknown>): string {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    let filename = `dashboard_${type}_${timestamp}`;

    if (filters?.startDate && filters?.endDate) {
        const start = dayjs(filters.startDate as string).format('YYYY-MM-DD');
        const end = dayjs(filters.endDate as string).format('YYYY-MM-DD');
        filename += `_${start}_to_${end}`;
    }

    return `${filename}.xlsx`;
}
