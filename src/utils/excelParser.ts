import * as XLSX from 'xlsx';

export interface ExcelSchemaSummary {
    headers: string[];
    rowCount: number;
    columnCount: number;
    sampleData: any[];
    dataTypes: Record<string, string>;
    possibleKeys: string[];
}

export const parseExcelFile = async (file: File): Promise<ExcelSchemaSummary> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON with a limit for initial sampling
                const fullData = XLSX.utils.sheet_to_json(worksheet);
                const headers = Object.keys(fullData[0] || {});

                // Analyze data types and keys
                const dataTypes: Record<string, string> = {};
                const possibleKeys: string[] = [];

                if (fullData.length > 0) {
                    headers.forEach(header => {
                        const val = (fullData[0] as any)[header];
                        dataTypes[header] = typeof val;

                        // Heuristic for possible keys: ID, Code, Name, etc.
                        if (header.toLowerCase().includes('id') ||
                            header.toLowerCase().includes('코드') ||
                            header.toLowerCase().includes('이름') ||
                            header.toLowerCase().includes('name') ||
                            header.toLowerCase().includes('key')) {
                            possibleKeys.push(header);
                        }
                    });
                }

                resolve({
                    headers,
                    rowCount: fullData.length,
                    columnCount: headers.length,
                    sampleData: fullData.slice(0, 10), // Only keep a tiny sample
                    dataTypes,
                    possibleKeys
                });
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};

/**
 * Detects potential mapping relationships between two files
 */
export const detectRelationships = (schemaA: ExcelSchemaSummary, schemaB: ExcelSchemaSummary) => {
    const commonHeaders = schemaA.headers.filter(h => schemaB.headers.includes(h));
    const mappingSuggestions = commonHeaders.map(header => ({
        sourceHeader: header,
        targetHeader: header,
        confidence: 'high',
        reason: 'Identical header name'
    }));

    return mappingSuggestions;
};
