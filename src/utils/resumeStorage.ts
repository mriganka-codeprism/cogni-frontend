/**
 * Utility functions to manage resume upload responses in localStorage
 */

export interface SavedResumeResponse {
  id: string;
  jobId: string;
  fileName: string;
  email: string;
  rank: number;
  status: string;
  score: number;
  decision: string;
  reasoning: string;
  strengths: any[];
  gaps: any[];
  scoreBreakdown?: Array<{
    criterion?: string;
    questionId?: string;
    weight?: number;
    score?: number;
    explanation?: string;
  }>;
  timestamp: number;
  fullData: any; // Store complete response for analysis modal
}

const STORAGE_KEY_PREFIX = "mucognitron_resume_responses_";

/**
 * Get the storage key for a specific job
 */
const getStorageKey = (jobId: string | number): string => {
  return `${STORAGE_KEY_PREFIX}${jobId}`;
};

/**
 * Save resume evaluation responses for a job
 */
export const saveResumeResponses = (
  jobId: string | number,
  responses: any[]
): void => {
  try {
    const storageKey = getStorageKey(jobId);
    
    // Convert responses to SavedResumeResponse format with timestamp
    const savedResponses: SavedResumeResponse[] = (Array.isArray(responses) ? responses : [responses]).map((item, index) => {
      // Extract scoreBreakdown - it could be directly on item or nested
      const scoreBreakdown = 
        item.scoreBreakdown || 
        item["scoreBreakdown"] || 
        item.summary?.[0]?.scoreBreakdown ||
        [];

      return {
        id: item.file_name || `resume_${Date.now()}_${index}`,
        jobId: String(jobId),
        fileName: item.file_name || "Uploaded Resume",
        email: item.email || "—",
        rank: item.rank || index + 1,
        status: item.status === "Success" ? "SUCCESS" : "FAILED",
        score: item["Resume Score"] ?? 0,
        decision:
          item.Decision === "SHORTLISTED"
            ? "SHORTLIST"
            : item.Decision === "REJECTED"
            ? "REJECT"
            : "PENDING",
        reasoning: item.Reason || item["View Summary"] || "",
        strengths: item.strengths || [],
        gaps: item.gaps || [],
        scoreBreakdown: scoreBreakdown,
        timestamp: Date.now(),
        fullData: item, // Store original data for modal
      };
    });

    // Get existing responses and append new ones
    let allResponses: SavedResumeResponse[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        allResponses = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse existing resume responses:", e);
    }

    // Add new responses
    allResponses = [...allResponses, ...savedResponses];

    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(allResponses));
    console.log(`✅ Saved ${savedResponses.length} resume response(s) for job ${jobId}`);
  } catch (error) {
    console.error("Failed to save resume responses to localStorage:", error);
  }
};

/**
 * Get all saved resume responses for a job
 */
export const getResumeResponses = (jobId: string | number): SavedResumeResponse[] => {
  try {
    const storageKey = getStorageKey(jobId);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to retrieve resume responses from localStorage:", error);
    return [];
  }
};

/**
 * Clear resume responses for a specific job
 */
export const clearResumeResponses = (jobId: string | number): void => {
  try {
    const storageKey = getStorageKey(jobId);
    localStorage.removeItem(storageKey);
    console.log(`✅ Cleared resume responses for job ${jobId}`);
  } catch (error) {
    console.error("Failed to clear resume responses:", error);
  }
};

/**
 * Delete a specific resume response
 */
export const deleteResumeResponse = (jobId: string | number, resumeId: string): void => {
  try {
    const responses = getResumeResponses(jobId);
    const filtered = responses.filter(r => r.id !== resumeId);
    
    const storageKey = getStorageKey(jobId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    console.log(`✅ Deleted resume response ${resumeId}`);
  } catch (error) {
    console.error("Failed to delete resume response:", error);
  }
};

/**
 * Get total count of saved responses for a job
 */
export const getResumeResponseCount = (jobId: string | number): number => {
  return getResumeResponses(jobId).length;
};
