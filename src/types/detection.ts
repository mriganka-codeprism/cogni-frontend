export interface EmotionProbabilities {
  happy: number;
  sad: number;
  angry: number;
  neutral: number;
  [key: string]: number; 
}

export interface HeartRateTimeSeries {
  heart_rates: number[];
  timestamps: number[];
  window_size: number;
}

export interface FFTData {
  frequencies: number[];
  amplitudes: number[];
}

export interface HeartRateVisualization {
  time_series: HeartRateTimeSeries;
  fft_data: FFTData;
}

export interface AdditionalData {
  name: string;
  gender: string;
  emotion: string;
  emotion_probabilities: EmotionProbabilities;
  heart_rate: number;
  heart_rate_viz: HeartRateVisualization;
}

export interface Detection {
  tracking_id: number;
  bbox: [number, number, number, number]; 
  frame_number: number;
  face_far: boolean;
  additional_data: AdditionalData;
}

export interface WebSocketDetectionResponse {
  timestamp: number;
  detections: Detection[];
} 