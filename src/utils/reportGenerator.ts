import ExcelJS from 'exceljs';
import pptxgen from 'pptxgenjs';

export const generateExcelReport = async (analysisData: any) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('AI Analysis Report');

    sheet.columns = [
        { header: '분석 항목', key: 'item', width: 30 },
        { header: '분석 결과 및 권장 사항', key: 'result', width: 70 },
    ];

    // Add data based on agent results
    sheet.addRow({ item: '출력 정의 (Output Definition)', result: analysisData.outputDefinition?.analysis || '정보 없음' });
    sheet.addRow({ item: '시각화 전략 (Visual Strategy)', result: analysisData.visualAnalyzer?.strategy || '정보 없음' });
    sheet.addRow({ item: '매핑 기준 (Mapping Key)', result: analysisData.masterAnalyzer?.mappingKey || '정보 없음' });

    // Style headers
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'AI_Analysis_Report.xlsx');
};

export const generatePPTReport = async (analysisData: any) => {
    const pres = new pptxgen();

    // Slide 1: Title
    const slide1 = pres.addSlide();
    slide1.background = { color: "1E293B" };
    slide1.addText("AI Data Visualization Report", {
        x: 1, y: 2, w: 8, h: 1,
        fontSize: 44, color: "F8FAFC", bold: true, align: "center"
    });
    slide1.addText("Produced by PronunFit AI Agent Collaboration", {
        x: 1, y: 3.5, w: 8, h: 0.5,
        fontSize: 18, color: "94A3B8", align: "center"
    });

    // Slide 2: Analysis Summary
    const slide2 = pres.addSlide();
    slide2.addText("Analysis Summary", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: "4F46E5", bold: true });
    slide2.addText(analysisData.outputDefinition?.analysis || "분석 내용 요약입니다.", { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18 });

    // Slide 3: Visualization Strategy
    const slide3 = pres.addSlide();
    slide3.addText("Visualization Strategy", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: "EC4899", bold: true });
    slide3.addText(analysisData.visualAnalyzer?.strategy || "시각화 추천 전략입니다.", { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 18 });

    await pres.writeFile({ fileName: "AI_Analysis_Report.pptx" });
};

const saveAs = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};
