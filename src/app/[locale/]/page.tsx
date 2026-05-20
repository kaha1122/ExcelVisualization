'use client';
import React, { useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Stack,
    Divider,
    LinearProgress,
    Fade
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';

import { useTranslations } from 'next-intl';
import { useAgentWorkflow } from '@/hooks/useAgentWorkflow';
import { parseExcelFile } from '@/utils/excelParser';
import { AgentFeedbackPanel } from '@/components/AgentFeedbackPanel';
import { generateExcelReport, generatePPTReport } from '@/utils/reportGenerator';

const UploadZone = ({
    title,
    description,
    icon,
    color,
    fileName,
    onFileSelect
}: {
    title: string,
    description: string,
    icon: React.ReactNode,
    color: string,
    fileName?: string,
    onFileSelect: (file: File) => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Paper
            onClick={() => inputRef.current?.click()}
            sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px dashed rgba(148, 163, 184, 0.2)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(30, 41, 59, 0.8)',
                    borderColor: color,
                    boxShadow: `0 8px 32px ${color}33`,
                }
            }}
        >
            <input
                type="file"
                hidden
                ref={inputRef}
                accept=".xlsx, .xls"
                onChange={(e) => {
                    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
                }}
            />
            <Box sx={{ color: fileName ? '#10b981' : color, mb: 2, transform: 'scale(1.5)' }}>
                {fileName ? <CheckCircleIcon /> : icon}
            </Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {fileName ? fileName : description}
            </Typography>
            <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                    mt: 'auto',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    color: 'text.primary'
                }}
            >
                {fileName ? '변경하기' : '파일 선택'}
            </Button>
        </Paper>
    );
};

export default function Home() {
    const t = useTranslations('Index');
    const agentT = useTranslations('Agent');
    const { files, setFiles, workflow, startWorkflow, submitFeedback, agentResults } = useAgentWorkflow();

    const handleFileSelect = async (type: 'master' | 'analyze' | 'related', file: File) => {
        try {
            const summary = await parseExcelFile(file);
            setFiles(prev => ({
                ...prev,
                [type]: { name: file.name, type, file, summary }
            }));
        } catch (err) {
            console.error(err);
            alert("파일 파싱 중 오류가 발생했습니다.");
        }
    };

    const activeAgentKey = workflow.activeAgentId as keyof typeof workflow.agents | null;
    const activeAgent = activeAgentKey ? workflow.agents[activeAgentKey] : null;

    const isAllCompleted = workflow.agents.outputDefinition.status === 'completed' &&
        workflow.agents.visualAnalyzer.status === 'completed' &&
        workflow.agents.masterAnalyzer.status === 'completed';

    return (
        <Box sx={{ minHeight: '100vh', py: 8 }}>
            <Container maxWidth="lg">
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography
                        variant="h2"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {t('title')}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                        {t('description')}
                    </Typography>
                </Box>

                {/* 3 Zones Grid */}
                {!isAllCompleted && (
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={4}>
                            <UploadZone
                                title={t('master_file')}
                                description={t('master_desc')}
                                icon={<FolderSpecialIcon />}
                                color="#6366f1"
                                fileName={files.master?.name}
                                onFileSelect={(f) => handleFileSelect('master', f)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <UploadZone
                                title={t('analyze_file')}
                                description={t('analyze_desc')}
                                icon={<AnalyticsIcon />}
                                color="#ec4899"
                                fileName={files.analyze?.name}
                                onFileSelect={(f) => handleFileSelect('analyze', f)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <UploadZone
                                title={t('related_file')}
                                description={t('related_desc')}
                                icon={<DescriptionIcon />}
                                color="#10b981"
                                fileName={files.related?.name}
                                onFileSelect={(f) => handleFileSelect('related', f)}
                            />
                        </Grid>
                    </Grid>
                )}

                {/* Feedback Panel */}
                {activeAgent && activeAgent.status === 'waiting_feedback' && (
                    <AgentFeedbackPanel
                        agentName={agentT(activeAgent.id)}
                        questions={activeAgent.feedbacks}
                        onSubmit={(qId, answer) => submitFeedback(workflow.activeAgentId as any, qId, answer)}
                    />
                )}

                {/* Workflow Progress */}
                {workflow.activeAgentId && (
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            AI 분석 엔진 협업 진행 현황
                        </Typography>
                        <Stack spacing={2}>
                            {Object.entries(workflow.agents).map(([key, agent]) => (
                                <Paper key={key} sx={{ p: 2, background: 'rgba(30, 41, 59, 0.3)', border: workflow.activeAgentId === key ? '1px solid #6366f1' : 'none' }}>
                                    <Stack direction="row" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {agentT(agent.id)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {agent.status}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant={agent.status === 'processing' ? 'indeterminate' : 'determinate'}
                                        value={agent.progress}
                                        color={agent.status === 'completed' ? 'success' : 'primary'}
                                    />
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Results / Download Section */}
                {isAllCompleted && (
                    <Fade in={true}>
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Paper sx={{ p: 6, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981' }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                                    최종 분석 보고서가 준비되었습니다.
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    AI 에이전트들이 협업하여 도출한 고도화된 보고서를 지금 바로 다운로드하세요.
                                </Typography>

                                <Stack direction="row" sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        startIcon={<TableChartIcon />}
                                        onClick={() => generateExcelReport(agentResults)}
                                        sx={{ px: 4 }}
                                    >
                                        Excel 보고서 다운로드
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="secondary"
                                        startIcon={<SlideshowIcon />}
                                        onClick={() => generatePPTReport(agentResults)}
                                        sx={{ px: 4 }}
                                    >
                                        PPT 보고서 다운로드
                                    </Button>
                                </Stack>
                            </Paper>
                        </Box>
                    </Fade>
                )}

                {/* Action Section */}
                {!workflow.activeAgentId && (
                    <Stack direction="row" sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={startWorkflow}
                            disabled={!files.master || !files.analyze}
                            sx={{
                                px: 6,
                                py: 1.5,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(45deg, #4f46e5, #6366f1)'
                            }}
                        >
                            {t('start_analysis')}
                        </Button>
                    </Stack>
                )}

                {/* Footer Info */}
                <Box sx={{ mt: 12, textAlign: 'center', opacity: 0.6 }}>
                    <Divider sx={{ mb: 4 }} />
                    <Typography variant="body2">
                        © 2026 PronunFit. Gemini 2.5 Flash API 활용.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
