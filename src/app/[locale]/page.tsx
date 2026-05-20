'use client';
import React, { useRef, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip, IconButton,
  LinearProgress, Divider, Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTranslations } from 'next-intl';
import { useAgentWorkflow } from '@/hooks/useAgentWorkflow';
import { parseExcelFile } from '@/utils/excelParser';
import { generateExcelReport, generatePPTReport } from '@/utils/reportGenerator';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';

/* ───────── Panel colours ───────── */
const PANEL_BG   = '#0d1b4b';   // dark navy
const PANEL_BDR  = '#1a3a8c';
const GREEN_ACC  = '#5cb85c';   // lime green accent
const GREEN_DARK = '#3d8b3d';

/* ───────── ONE AGENT PANEL ───────── */
interface PanelProps {
  title: string;
  subtitle: string;
  agentKey: 'master' | 'analyze' | 'related' | 'output';
  fileName?: string;
  agentStatus: string;
  agentProgress: number;
  feedbacks: any[];
  onFileSelect?: (f: File) => void;
  onAnswer: (answer: string) => void;
}

function AgentPanel({
  title, subtitle, agentKey, fileName, agentStatus, agentProgress,
  feedbacks, onFileSelect, onAnswer
}: PanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userInput, setUserInput] = useState('');

  const isRunning  = agentStatus === 'processing';
  const isWaiting  = agentStatus === 'waiting_feedback';
  const isDone     = agentStatus === 'completed';

  const handleSend = () => {
    if (!userInput.trim()) return;
    onAnswer(userInput.trim());
    setUserInput('');
  };

  return (
    <Paper sx={{
      background: PANEL_BG,
      border: `1px solid ${PANEL_BDR}`,
      borderRadius: 3,
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: GREEN_ACC, borderRadius: '12px 12px 0 0' }} />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <SmartToyIcon sx={{ color: GREEN_ACC, fontSize: 22 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e8f5e9', lineHeight: 1.2 }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: '#90caf9', opacity: 0.8 }}>{subtitle}</Typography>
        </Box>
        {isDone && <CheckCircleOutlineIcon sx={{ color: GREEN_ACC, ml: 'auto' }} />}
        {(isRunning || isWaiting) && (
          <Chip label={isWaiting ? '답변 필요' : '분석 중'} size="small"
            color={isWaiting ? 'warning' : 'primary'} sx={{ ml: 'auto', fontWeight: 700 }} />
        )}
      </Box>

      {/* Progress */}
      {(isRunning || isDone) && (
        <LinearProgress variant={isRunning ? 'indeterminate' : 'determinate'}
          value={agentProgress} color={isDone ? 'success' : 'primary'}
          sx={{ borderRadius: 2, height: 6 }} />
      )}

      {/* File Upload Zone */}
      {onFileSelect && (
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            border: `2px dashed ${fileName ? GREEN_ACC : PANEL_BDR}`,
            borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s',
            '&:hover': { borderColor: GREEN_ACC, background: 'rgba(92,184,92,0.05)' }
          }}
        >
          <input type="file" hidden ref={inputRef} accept=".xlsx,.xls"
            onChange={e => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }} />
          <CloudUploadIcon sx={{ color: fileName ? GREEN_ACC : '#5c7db8', mb: 0.5 }} />
          <Typography variant="body2" sx={{ color: fileName ? GREEN_ACC : '#7fa8d8', fontWeight: 600 }}>
            {fileName ?? '파일 업로드'}
          </Typography>
        </Box>
      )}

      {/* Q&A Feedback Area */}
      {feedbacks.length > 0 && (
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {feedbacks.map((fb: any, i: number) => (
            <Box key={i}>
              <Box sx={{ background: 'rgba(144,202,249,0.1)', borderRadius: 2, p: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#90caf9', fontWeight: 600, mb: 0.5, fontSize: 12 }}>🤖 AI 질문</Typography>
                <Typography variant="body2" sx={{ color: '#e3f2fd', fontSize: 12 }}>{fb.question}</Typography>
              </Box>
              {fb.answer && (
                <Box sx={{ background: 'rgba(92,184,92,0.1)', borderRadius: 2, p: 1.5, mt: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#a5d6a7', fontWeight: 600, mb: 0.5, fontSize: 12 }}>👤 내 답변</Typography>
                  <Typography variant="body2" sx={{ color: '#e8f5e9', fontSize: 12 }}>{fb.answer}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* User Input */}
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <TextField
          fullWidth size="small" multiline maxRows={3}
          placeholder={isWaiting ? 'AI 질문에 답변하세요...' : '추가 요청사항 입력...'}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.05)',
              color: '#e3f2fd',
              fontSize: 12,
              '& fieldset': { borderColor: PANEL_BDR },
              '&:hover fieldset': { borderColor: '#5c7db8' },
              '&.Mui-focused fieldset': { borderColor: GREEN_ACC },
            },
            '& .MuiInputBase-input::placeholder': { color: '#5c7db8', opacity: 1 },
          }}
        />
        <IconButton onClick={handleSend} disabled={!userInput.trim()}
          sx={{ bgcolor: GREEN_ACC, color: '#fff', '&:hover': { bgcolor: GREEN_DARK }, '&.Mui-disabled': { bgcolor: PANEL_BDR } }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

/* ───────── MAIN PAGE ───────── */
export default function Home() {
  const t = useTranslations('Index');
  const { files, setFiles, workflow, startWorkflow, submitFeedback, agentResults } = useAgentWorkflow();

  const handleFileSelect = async (type: 'master' | 'analyze' | 'related', file: File) => {
    try {
      const summary = await parseExcelFile(file);
      setFiles(prev => ({ ...prev, [type]: { name: file.name, type, file, summary } }));
    } catch (err) { console.error(err); }
  };

  type AgentKey = keyof typeof workflow.agents;

  const isAllCompleted =
    workflow.agents.outputDefinition.status === 'completed' &&
    workflow.agents.masterAnalyzer.status === 'completed' &&
    workflow.agents.visualAnalyzer.status === 'completed' &&
    workflow.agents.relatedAnalyzer.status === 'completed';

  const panels = [
    {
      agentKey: 'output' as const,
      wfKey: 'outputDefinition' as AgentKey,
      title: 'Output Image',
      subtitle: 'OutputDefinition Agent',
      fileType: 'analyze' as const,
      fileName: files.analyze?.name,
    },
    {
      agentKey: 'analyze' as const,
      wfKey: 'visualAnalyzer' as AgentKey,
      title: 'Main Data',
      subtitle: 'VisualAnalyzer Agent',
      fileType: 'analyze' as const,
      fileName: files.analyze?.name,
    },
    {
      agentKey: 'master' as const,
      wfKey: 'masterAnalyzer' as AgentKey,
      title: 'Master Data',
      subtitle: 'MasterAnalyzer Agent',
      fileType: 'master' as const,
      fileName: files.master?.name,
    },
    {
      agentKey: 'related' as const,
      wfKey: 'relatedAnalyzer' as AgentKey,
      title: 'Mapping Data',
      subtitle: 'RelatedAnalyzer Agent',
      fileType: 'related' as const,
      fileName: files.related?.name,
    },
  ];

  return (
    /* Outer green-sided wrapper */
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a3a1a 0%, #0d1b0d 50%, #1a3a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      p: { xs: 1, md: 2 },
    }}>
      {/* Green side accents */}
      <Box sx={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: { xs: 12, md: 24 },
        background: 'linear-gradient(180deg, #5cb85c 0%, #2d6a2d 50%, #5cb85c 100%)',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: { xs: 12, md: 24 },
        background: 'linear-gradient(180deg, #5cb85c 0%, #2d6a2d 50%, #5cb85c 100%)',
        zIndex: 0,
      }} />

      {/* Content wrapper */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1400, mx: 'auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
          <Typography variant="h4" sx={{
            fontWeight: 900, letterSpacing: 2,
            background: 'linear-gradient(90deg, #5cb85c, #a5d6a7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Excel Visualization
          </Typography>
          <Typography variant="body2" sx={{ color: '#90caf9', mt: 0.5 }}>
            4 AI Agents · 협업 분석 · 시각화 보고서 자동 생성
          </Typography>
        </Box>

        {/* 2×2 Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 2,
          flex: 1,
          minHeight: 0,
          pb: 2,
        }}>
          {panels.map((panel) => {
            const agent = workflow.agents[panel.wfKey];
            return (
              <AgentPanel
                key={panel.wfKey}
                title={panel.title}
                subtitle={panel.subtitle}
                agentKey={panel.agentKey}
                fileName={panel.fileName}
                agentStatus={agent.status}
                agentProgress={agent.progress}
                feedbacks={agent.feedbacks}
                onFileSelect={(f) => handleFileSelect(panel.fileType, f)}
                onAnswer={(answer) => submitFeedback(panel.wfKey, 'q_0', answer)}
              />
            );
          })}
        </Box>

        {/* Bottom Action Bar */}
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {!isAllCompleted ? (
            <Button variant="contained" size="large" onClick={startWorkflow}
              disabled={!files.master && !files.analyze}
              sx={{ px: 6, fontWeight: 700, background: 'linear-gradient(90deg, #3d8b3d, #5cb85c)',
                    '&:hover': { background: 'linear-gradient(90deg, #2d6a2d, #3d8b3d)' } }}>
              🚀 AI 분석 시작하기
            </Button>
          ) : (
            <>
              <Button variant="contained" startIcon={<TableChartIcon />} onClick={() => generateExcelReport(agentResults)}
                sx={{ px: 4, bgcolor: '#1565c0' }}>Excel 보고서 다운로드</Button>
              <Button variant="contained" startIcon={<SlideshowIcon />} onClick={() => generatePPTReport(agentResults)}
                sx={{ px: 4, bgcolor: '#6a1b9a' }}>PPT 보고서 다운로드</Button>
            </>
          )}
        </Box>

        <Divider sx={{ borderColor: '#1a3a1a', mb: 1 }} />
        <Typography variant="caption" sx={{ textAlign: 'center', color: '#3d8b3d', pb: 1 }}>
          © 2026 PronunFit · Powered by Gemini AI
        </Typography>
      </Box>
    </Box>
  );
}
