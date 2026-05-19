export type QuestionScale = "Easy" | "Intermediate" | "Difficult";
export type ModelBehaviour = "Lenient" | "Neutral" | "Strict";
export type PersonaType =
  | "Technical"
  | "Business"
  | "Management"
  | "Sales"
  | "Creative"
  | "Tech/Business/Math";

export interface StreamSetting {
  questionScale: QuestionScale;
  modelBehaviour: ModelBehaviour;
  selectedCategories: string[];
  personaType: PersonaType;
  cutoff?: number | "";
  framework?: string;
  avatar: string[];
  duration?: number | "";
  codingRound?: boolean;
  proctoringEnabled?: boolean;
  codingQuestionCount?: number | "";
  codingTimeLimit?: number | "";
} 