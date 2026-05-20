import { GoogleGenerativeAI } from "@google/generative-ai";

// Guard: only initialize if API key is present
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

export interface AgentContext {
  masterSummary?: any;
  analyzeSummary?: any;
  relatedSummary?: any;
  userOutputDraft?: string;
  previousAgentResults?: Record<string, string>;
  userFeedback?: Record<string, string>;
}

export const AGENT_PROMPTS = {
  OutputDefinition: (context: AgentContext) => `
    당신은 OutputDefinition 에이전트입니다. 사용자가 최종적으로 원하는 시각화 보고서의 목적과 형태를 정의합니다.
    마스터 파일 구조: ${JSON.stringify(context.masterSummary)}
    분석 대상 파일 구조: ${JSON.stringify(context.analyzeSummary)}
    
    사용자에게 이 데이터로 어떤 종류의 보고서(예: 매출 분석, 생산성 지표 등)를 만들고 싶은지, 
    그리고 특별히 강조하고 싶은 지표가 있는지 물어보는 질문을 1~2개 생성해주세요.
    응답 형식: JSON { "analysis": "데이터 구조 분석 요약", "questions": ["질문1", "질문2"] }
  `,

  VisualAnalyzer: (context: AgentContext) => `
    당신은 VisualAnalyzer 에이전트입니다. OutputDefinition 에이전트의 정의와 사용자 피드백을 바탕으로 시각화 전략을 세웁니다.
    결과 정의: ${context.previousAgentResults?.outputDefinition}
    사용자 답변: ${context.userFeedback?.outputDefinition}
    분석 데이터 구조: ${JSON.stringify(context.analyzeSummary)}
    
    데이터에서 어떤 차트(Bar, Line, Pie 등)가 적합할지 제안하고, 
    X축과 Y축에 매핑할 컬럼에 대해 사용자에게 확인을 구하는 질문을 생성해주세요.
    응답 형식: JSON { "strategy": "시각화 전략 설명", "questions": ["질문1"] }
  `,

  MasterAnalyzer: (context: AgentContext) => `
    당신은 MasterAnalyzer 에이전트입니다. 마스터 파일에서 분석에 꼭 필요한 기준 정보를 추출합니다.
    마스터 데이터 구조: ${JSON.stringify(context.masterSummary)}
    목표: ${context.previousAgentResults?.outputDefinition}
    
    마스터 파일의 어떤 컬럼이 분석 파일의 키값과 매핑되어야 하는지 분석하고, 
    매핑 기준이 모호하다면 사용자에게 확인 질문을 던지세요.
    응답 형식: JSON { "summary": "마스터 데이터 요약", "mappingKey": "추천 키", "questions": [] }
  `,

  RelatedAnalyzer: (context: AgentContext) => `
    당신은 RelatedAnalyzer 에이전트입니다. 분석을 보완할 관련 데이터의 매핑을 담당합니다.
    관련 데이터 구조: ${JSON.stringify(context.relatedSummary)}
    현재까지 분석 내용: ${context.previousAgentResults?.visualAnalyzer}
    
    관련 파일에서 분석 파일의 데이터를 보정하거나 추가 정보를 줄 수 있는 부분을 찾고 사용자에게 확인하세요.
    응답 형식: JSON { "analysis": "관련성 분석", "questions": ["질문1"] }
  `
};

export const callAgent = async (agentName: keyof typeof AGENT_PROMPTS, context: AgentContext) => {
  if (!model) {
    console.warn('Gemini API key not configured. Returning mock response.');
    return { analysis: '(API 키 미설정)', questions: [], strategy: '', summary: '', mappingKey: '' };
  }

  const prompt = AGENT_PROMPTS[agentName](context);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { text };
  } catch (e) {
    return { text };
  }
};
