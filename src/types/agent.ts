import { ExcelSchemaSummary } from '../utils/excelParser';

export type AgentStatus = 'pending' | 'processing' | 'waiting_feedback' | 'completed' | 'error';

export interface AgentFeedback {
    id: string;
    agentId: string;
    question: string;
    answer?: string;
    timestamp: number;
}

export interface AgentState {
    id: string;
    name: string;
    status: AgentStatus;
    progress: number; // 0 to 100
    feedbacks: AgentFeedback[];
    result?: any;
}

export type AgentWorkFlowState = {
    activeAgentId: string | null;
    agents: {
        outputDefinition: AgentState;
        masterAnalyzer: AgentState;
        visualAnalyzer: AgentState;
        relatedAnalyzer: AgentState;
    };
};

export interface ExcelFileData {
    name: string;
    type: 'master' | 'analyze' | 'related';
    summary?: ExcelSchemaSummary; // Changed from 'content' to 'summary'
    file?: File;
}
