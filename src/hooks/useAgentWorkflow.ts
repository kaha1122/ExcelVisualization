'use client';

import { useState, useCallback } from 'react';
import { AgentWorkFlowState, AgentStatus, ExcelFileData, AgentFeedback } from '../types/agent';
import { callAgent, AgentContext } from '../lib/gemini';

const initialAgentState = (id: string, name: string) => ({
    id,
    name,
    status: 'pending' as AgentStatus,
    progress: 0,
    feedbacks: [],
});

export function useAgentWorkflow() {
    const [workflow, setWorkflow] = useState<AgentWorkFlowState>({
        activeAgentId: null,
        agents: {
            outputDefinition: initialAgentState('outputDefinition', 'Output Definition'),
            masterAnalyzer: initialAgentState('masterAnalyzer', 'Master Analyzer'),
            visualAnalyzer: initialAgentState('visualAnalyzer', 'Visual Analyzer'),
            relatedAnalyzer: initialAgentState('relatedAnalyzer', 'Related Analyzer'),
        },
    });

    const [files, setFiles] = useState<{
        master?: ExcelFileData;
        analyze?: ExcelFileData;
        related?: ExcelFileData;
    }>({});

    const [agentResults, setAgentResults] = useState<Record<string, any>>({});
    const [userFeedbacks, setUserFeedbacks] = useState<Record<string, string>>({});

    const updateAgent = useCallback((agentKey: keyof AgentWorkFlowState['agents'], updates: Partial<any>) => {
        setWorkflow(prev => ({
            ...prev,
            agents: {
                ...prev.agents,
                [agentKey]: { ...prev.agents[agentKey], ...updates }
            }
        }));
    }, []);

    const startWorkflow = async () => {
        if (!files.master || !files.analyze) {
            alert("마스터 파일과 분석할 파일을 먼저 업로드해주세요.");
            return;
        }

        // 1. OutputDefinition 에이전트 시작
        setWorkflow(prev => ({ ...prev, activeAgentId: 'outputDefinition' }));
        updateAgent('outputDefinition', { status: 'processing', progress: 20 });

        const context: AgentContext = {
            masterSummary: files.master.summary,
            analyzeSummary: files.analyze.summary,
            relatedSummary: files.related?.summary,
        };

        try {
            const result = await callAgent('OutputDefinition', context);
            setAgentResults(prev => ({ ...prev, outputDefinition: result }));

            if (result.questions && result.questions.length > 0) {
                const feedbacks: AgentFeedback[] = result.questions.map((q: string, i: number) => ({
                    id: `q_${i}`,
                    agentId: 'outputDefinition',
                    question: q,
                    timestamp: Date.now()
                }));
                updateAgent('outputDefinition', { status: 'waiting_feedback', feedbacks, progress: 50 });
            } else {
                // 질문 없으면 다음 단계 (이 프로토타입에선 수동으로 넘어가거나 자동 처리 가능)
                updateAgent('outputDefinition', { status: 'completed', progress: 100 });
            }
        } catch (err) {
            console.error(err);
            updateAgent('outputDefinition', { status: 'error' });
        }
    };

    const submitFeedback = async (agentKey: keyof AgentWorkFlowState['agents'], feedbackId: string, answer: string) => {
        // 피드백 저장
        setUserFeedbacks(prev => ({ ...prev, [agentKey]: answer }));

        // 해당 에이전트 완료 처리 및 다음 에이전트로 이동 로직 (Prototype)
        updateAgent(agentKey, { status: 'completed', progress: 100 });

        // 순서: Output -> Master -> Visual -> Related
        if (agentKey === 'outputDefinition') {
            runMasterAnalyzer();
        } else if (agentKey === 'masterAnalyzer') {
            runVisualAnalyzer();
        } // ... etc
    };

    const runMasterAnalyzer = async () => {
        updateAgent('masterAnalyzer', { status: 'processing', progress: 30 });
        // AI Call...
        const result = await callAgent('MasterAnalyzer', {
            masterSummary: files.master?.summary,
            previousAgentResults: agentResults,
            userFeedback: userFeedbacks
        });
        setAgentResults(prev => ({ ...prev, masterAnalyzer: result }));
        updateAgent('masterAnalyzer', { status: 'completed', progress: 100 });

        // 자동 다음 단계
        runVisualAnalyzer();
    };

    const runVisualAnalyzer = async () => {
        updateAgent('visualAnalyzer', { status: 'processing', progress: 30 });
        const result = await callAgent('VisualAnalyzer', {
            analyzeSummary: files.analyze?.summary,
            previousAgentResults: agentResults,
            userFeedback: userFeedbacks
        });
        setAgentResults(prev => ({ ...prev, visualAnalyzer: result }));
        updateAgent('visualAnalyzer', { status: 'completed', progress: 100 });
    };

    return {
        workflow,
        files,
        setFiles,
        startWorkflow,
        submitFeedback,
        agentResults
    };
}
