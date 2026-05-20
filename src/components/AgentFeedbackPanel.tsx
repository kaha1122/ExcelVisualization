'use client';
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Chip,
    Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface AgentFeedbackProps {
    agentName: string;
    questions: any[];
    onSubmit: (id: string, answer: string) => void;
}

export const AgentFeedbackPanel = ({ agentName, questions, onSubmit }: AgentFeedbackProps) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});

    if (!questions || questions.length === 0) return null;

    return (
        <Fade in={true}>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 4, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1' }}>
                    <Stack direction="row" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>

                            {agentName}의 확인 요청
                        </Typography>
                        <Chip label="Response Required" size="small" color="primary" variant="outlined" />
                    </Stack>

                    <Stack spacing={3}>
                        {questions.map((q) => (
                            <Box key={q.id}>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                    {q.question}
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="답변을 입력해주세요..."
                                    value={answers[q.id] || ''}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    sx={{ background: 'rgba(0,0,0,0.2)' }}
                                />
                                <Button
                                    sx={{ mt: 1 }}
                                    variant="contained"
                                    onClick={() => onSubmit(q.id, answers[q.id])}
                                    disabled={!answers[q.id]}
                                    endIcon={<SendIcon />}
                                >
                                    확인 완료
                                </Button>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </Fade>
    );
};
