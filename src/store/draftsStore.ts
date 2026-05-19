import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Draft {
    id: string;
    title: string;
    description: string;
    savedAt: string;
    progress: number;
    stoppedAt: string;
    activeStep: number; // Added to restore exact page
    tags: string[];
    data: any; // Full session data
}

interface DraftsState {
    drafts: Draft[];
    addDraft: (draft: Draft) => void;
    removeDraft: (id: string) => void;
    clearDrafts: () => void;
    isDirty: boolean;
    setDirty: (dirty: boolean) => void;
    pendingLocation: string | null;
    setPendingLocation: (location: string | null) => void;
    showLeaveModal: boolean;
    setShowLeaveModal: (show: boolean) => void;
}

// Custom storage wrapper to handle QuotaExceededError gracefully
const customStorage = {
    getItem: (name: string) => localStorage.getItem(name),
    setItem: (name: string, value: string) => {
        try {
            localStorage.setItem(name, value);
        } catch (error: any) {
            if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
                console.warn('LocalStorage quota exceeded. Drafts may not be saved.');
                // You could also add a user-facing notification here if needed
            } else {
                throw error;
            }
        }
    },
    removeItem: (name: string) => localStorage.removeItem(name),
};

export const useDraftsStore = create<DraftsState>()(
    persist(
        (set) => ({
            drafts: [],
            addDraft: (draft) =>
                set((state) => {
                    // Check if draft already exists to avoid duplicates
                    const existingDraftIndex = state.drafts.findIndex(d => d.id === draft.id);
                    if (existingDraftIndex !== -1) {
                        const newDrafts = [...state.drafts];
                        newDrafts[existingDraftIndex] = draft;
                        return { drafts: newDrafts };
                    }
                    return { drafts: [draft, ...state.drafts] };
                }),
            removeDraft: (id) =>
                set((state) => ({
                    drafts: state.drafts.filter((d) => d.id !== id),
                })),
            clearDrafts: () => set({ drafts: [] }),
            isDirty: false,
            setDirty: (dirty) => set({ isDirty: dirty }),
            pendingLocation: null,
            setPendingLocation: (location) => set({ pendingLocation: location }),
            showLeaveModal: false,
            setShowLeaveModal: (show) => set({ showLeaveModal: show }),
        }),
        {
            name: 'job-drafts-storage',
            storage: createJSONStorage(() => customStorage),
            //@ts-ignore
            partialize: (state) => ({ drafts: state.drafts }), // Only persist drafts
        }
    )
);
