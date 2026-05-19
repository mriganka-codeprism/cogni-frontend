import { useState, useCallback } from 'react';
import { apiClient } from '../api/interceptor';
import { useCandidateStore } from '../store/candidateStore';

interface CodingRoundResponse {
  id: string;
  conversationId: string;
  content: string;
  isCode: boolean;
  senderType: string;
  createdAt: string;
}

interface CodingTask {
  id: string;
  text: string;
  language: string;
}

interface CodingRoundError {
  message: string;
  code?: string;
}

const useCodingRound = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [tasks, setTasks] = useState<CodingTask[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<CodingRoundError | null>(null);
  const [isCodingRoundActive, setIsCodingRoundActive] = useState(false);

  const wrapCodeInMarkdown = useCallback((code: string, language: string = 'python'): string => {
    const trimmedCode = code.trim();
    return `\`\`\`${language}\n${trimmedCode}\n\`\`\``;
  }, []);

  const submitCodeResponse = useCallback(
    async (conversationId: string, code: string, language: string = 'python', taskId?: string): Promise<CodingRoundResponse> => {
      const userId = useCandidateStore.getState().userId;

      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!code || !code.trim()) {
        throw new Error('Code cannot be empty');
      }

      if (code.length > 50000) {
        throw new Error('Code exceeds maximum length of 50000 characters');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const wrappedCode = wrapCodeInMarkdown(code, language);

        const payload: any = {
          conversationId,
          senderId: userId,
          content: wrappedCode,
          isCode: true,
          senderType: 'user',
        };
        if (taskId) {
          payload.taskId = taskId;
        }

        const response = await apiClient.post(`/communication/messages`, payload);

        if (!response.data) {
          throw new Error('No response from server');
        }

        const result: CodingRoundResponse = {
          id: response.data.id,
          conversationId: conversationId,
          content: response.data.content,
          isCode: response.data.isCode,
          senderType: response.data.senderType,
          createdAt: response.data.createdAt,
        };

        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to submit code';
        const errorObj: CodingRoundError = {
          message: errorMessage,
          code: err.response?.status?.toString(),
        };
        setError(errorObj);

        console.error('Code submission error:', err);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [wrapCodeInMarkdown]
  );

  const activateCodingRound = useCallback((language: string = 'python') => {
    setShowEditor(true);
    setIsCodingRoundActive(true);
  }, []);

  const deactivateCodingRound = useCallback(() => {
    setShowEditor(false);
    setTasks([]);
    setTimeLeft(null);
    setIsCodingRoundActive(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    showEditor,
    tasks,
    timeLeft,
    isSubmitting,
    error,
    isCodingRoundActive,
    submitCodeResponse,
    setShowEditor,
    setTasks,
    setTimeLeft,
    activateCodingRound,
    deactivateCodingRound,
    clearError,
    wrapCodeInMarkdown,
  };
};

export default useCodingRound;
