
import React from 'react';

export type DimensionType = 'MATERIAL' | 'ZENITH' | 'ETHEREAL';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized?: boolean;
  zIndex: number;
}

export interface NeuralExperience {
  id: string;
  goal: string;
  outcome: 'success' | 'failure' | 'partial';
  lessons: string[];
  timestamp: Date;
}

export interface DreamState {
  isDreaming: boolean;
  currentDream?: string;
  intensity: number;
  simulationType: 'hypothetical' | 'philosophical' | 'optimization' | 'creative';
}

export interface DebugReport {
  isValid: boolean;
  criticalFlaw?: string;
  issues?: {
    type: string;
    description: string;
    suggestedFix: string;
  }[];
}

export interface InterviewBrief {
  id: string;
  topic: string;
  potentialQuestions: string[];
  keyTalkingPoints: string[];
  strategy: string;
}

export interface SentimentData {
  score: number;
  label: 'positive' | 'neutral' | 'skeptical' | 'negative';
  trend: 'rising' | 'falling' | 'stable';
}

export interface CloneProfile {
  name: string;
  personality: string;
  background: string;
  speakingStyle: string;
  hobbies: string[];
  avatar?: string;
}

export interface LedgerEntry {
  id: string;
  type: 'THOUGHT' | 'ACTION' | 'SYNC' | 'LEARNING' | 'DREAM';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface SubAgent {
  id: string;
  name: string;
  specialization: 'researcher' | 'coder' | 'debugger' | 'architect' | 'analyst';
  status: 'idle' | 'working' | 'done' | 'failed';
}

export interface SubTask {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying' | 'debugging' | 'interrupted';
  description: string;
  assignedAgentId?: string;
  result?: string;
  error?: string;
  securityReport?: string;
  handoff?: string;
  debugReports?: DebugReport[];
  feedbackLoop?: {
    timestamp: Date;
    attempt: number;
    type: 'CORRECTION' | 'OPTIMIZATION';
    critique: string;
    suggestion: string;
  }[];
  diagnostics?: {
    memoryLoad: number;
    confidence: number;
    lastLogs: string[];
  };
}

export interface AgentTask {
  id: string;
  goal: string;
  status: 'planning' | 'executing' | 'correcting' | 'completed' | 'failed';
  subtasks: SubTask[];
  agents: SubAgent[];
  reasoning: string;
  sharedInsights: string[];
  timestamp: Date;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  type: 'product' | 'article' | 'security_report' | 'pattern' | 'general' | 'dream_insight';
  timestamp: Date;
  importance: 1 | 2 | 3 | 4 | 5;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'learning' | 'dream';
  timestamp: Date;
  isRead: boolean;
}

export interface NeuralPattern {
  id: string;
  trigger: string;
  action: string;
  frequency: number;
  confidence: number;
  lastDetected: Date;
}

export interface AppTheme {
  id: string;
  name: string;
  background: string;
  accent: string;
  taskbar: string;
  windowBg: string;
  borderRadius: string;
  fontFamily: string;
  glassBlur: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export interface SyntaxTheme {
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  background: string;
  text: string;
}

export interface SocialAccount {
  id: string;
  platform: 'Twitter' | 'Instagram' | 'LinkedIn';
  handle: string;
  bio: string;
  avatar: string;
  followers: number;
  engagementRate: string;
  strategy: string;
}

export interface Post {
  id: string;
  accountId: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  stats: {
    likes: number;
    shares: number;
    comments: number;
  };
}
