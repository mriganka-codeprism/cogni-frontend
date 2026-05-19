/**
 * Generates a custom reference ID from database job ID
 * Format: JOB-{paddedId} or JOB-{hash}
 * Example: JOB-000123 or JOB-ABC123
 */
export const generateCustomReference = (jobId: number | string): string => {
  const idStr = String(jobId);
  
  // Pad the ID with leading zeros
  // If ID is numeric, pad to 6 digits
  if (/^\d+$/.test(idStr)) {
    const paddedId = idStr.padStart(6, '0');
    return `JOB-${paddedId}`;
  }
  
  // If ID is already a string/hash, use first 6 characters
  return `JOB-${idStr.slice(0, 6).toUpperCase()}`;
};
