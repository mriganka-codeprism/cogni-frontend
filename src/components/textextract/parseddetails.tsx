interface ParsedDetails {
    name?: string;
    email?: string;
    college?: string;
    rollNumber?: string;
  }
  
  export const parseCandidateDetails = (text: string): ParsedDetails => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const result: ParsedDetails = {};
  
    for (const line of lines) {
      const lower = line.toLowerCase();
  
      if (!result.name && lower.startsWith("name:")) {
        result.name = line.split(":")[1]?.trim();
      }
  
      if (!result.college && lower.includes("college name:")) {
        result.college = line.split(":")[1]?.trim();
      }
  
      if (!result.email) {
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const emailMatch = line.match(emailRegex);
        if (emailMatch) {
          result.email = emailMatch[0];
        }
      }
      
      if (!result.rollNumber && lower.includes("roll") && line.includes(":")) {
        result.rollNumber = line.split(":")[1]?.trim();
      }
    }
  
    return result;
  };  