import { BulkImportJob } from './types';

export interface ParsedJob extends BulkImportJob {
  status?: 'APPLIED' | 'REJECTED';
  location?: string;
  notes?: string;
}

interface ParseResult {
  jobs: ParsedJob[];
  errors: string[];
}

export function parseJobList(text: string): ParseResult {
  const lines = text.split('\n');
  const jobs: ParsedJob[] = [];
  const errors: string[] = [];
  let currentDate: Date | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Check if line is a date header
      const dateMatch = parseDate(line);
      if (dateMatch) {
        currentDate = dateMatch;
        continue;
      }
      
      // Skip lines that are clearly not job entries
      if (isMetadataLine(line)) {
        continue;
      }
      
      // Parse job entry
      const job = parseJobEntry(line, currentDate);
      if (job) {
        jobs.push(job);
      } else {
        errors.push(`Line ${i + 1}: Could not parse "${line}"`);
      }
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { jobs, errors };
}

function parseDate(line: string): Date | null {
  // Match date patterns like "15 Jan", "16 January", "18 January"
  const datePattern = /^(\d{1,2})\s+(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)$/i;
  
  const match = line.match(datePattern);
  if (match) {
    const day = parseInt(match[1]);
    const month = match[2];
    
    // Convert month name to number
    const monthNum = getMonthNumber(month);
    if (monthNum !== null) {
      // Use 2025 for the year since these are recent applications
      return new Date(2025, monthNum, day);
    }
  }
  
  return null;
}

function getMonthNumber(monthName: string): number | null {
  const months: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };
  
  return months[monthName.toLowerCase()] ?? null;
}

function isMetadataLine(line: string): boolean {
  // Skip lines that are clearly not job entries
  const skipPatterns = [
    /^Job Applications?$/i,
    /^Applications?$/i,
    /^-+$/,  // Just dashes
    /^=+$/,  // Just equals
    /^\s*$/, // Empty or whitespace only
    /^[-•*]?\s*(contacted|reached out|messaged|applied|updated|reuploaded)/i, // Action lines
    /^[-•*]?\s*Reached out to .+(on LinkedIn|via LinkedIn)/i, // LinkedIn outreach notes
    /^[-•*]?\s*(Reached out to Pluguzio|Reached out to)/i, // General outreach notes
  ];
  
  return skipPatterns.some(pattern => pattern.test(line));
}

function parseJobEntry(line: string, defaultDate: Date | null): ParsedJob | null {
  // Remove common prefixes
  let cleanLine = line
    .replace(/^[-•*]\s*/, '') // Remove bullet points
    .replace(/^\d+\.\s*/, '') // Remove numbered list
    .trim();
  
  if (!cleanLine) return null;
  
  // Detect rejection status
  const isRejected = cleanLine.includes('❌');
  cleanLine = cleanLine.replace(/❌/g, '').trim();
  
  // Extract company and title
  let company = '';
  let title = '';
  let location = '';
  let notes = '';
  
  // Pattern 1: "Company - Job Title" or "Company - Job Title (Location)"
  const match = cleanLine.match(/^(.+?)\s*-\s*(.+?)(\s*\([^)]+\))?$/);
  if (match) {
    company = match[1].trim();
    const titleAndLocation = match[2].trim();
    
    // Extract location from parentheses
    const locationMatch = titleAndLocation.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (locationMatch) {
      title = locationMatch[1].trim();
      location = locationMatch[2].trim();
    } else {
      title = titleAndLocation;
    }
  } else {
    // Pattern 2: Just company name, possibly with parenthetical info
    const companyMatch = cleanLine.match(/^([^(]+)(\s*\([^)]*\))?(.*)$/);
    if (companyMatch) {
      company = companyMatch[1].trim();
      const parenthetical = companyMatch[2];
      const remainder = companyMatch[3]?.trim();
      
      // Check if parenthetical contains location info
      if (parenthetical) {
        const parenContent = parenthetical.replace(/[()]/g, '');
        if (isLocationInfo(parenContent)) {
          location = parenContent;
        } else {
          notes = parenContent;
        }
      }
      
      // If there's additional text after parentheses, it might be notes
      if (remainder) {
        notes = notes ? `${notes}. ${remainder}` : remainder;
      }
      
      title = 'Software Engineer'; // Default title
    } else {
      // Fallback: treat the whole line as company name
      company = cleanLine;
      title = 'Software Engineer';
    }
  }
  
  // Clean up extracted fields
  company = cleanCompanyName(company);
  title = cleanJobTitle(title);
  location = cleanLocation(location);
  notes = cleanNotes(notes);
  
  if (!company) return null;
  
  return {
    company,
    title: title || 'Software Engineer',
    applicationDate: defaultDate || new Date(),
    status: isRejected ? 'REJECTED' : 'APPLIED',
    location: location || undefined,
    notes: notes || undefined
  };
}

function isLocationInfo(text: string): boolean {
  const locationKeywords = ['vancouver', 'seattle', 'remote', 'san francisco', 'toronto', 'canada', 'usa'];
  return locationKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function cleanCompanyName(company: string): string {
  // Don't over-clean if it's already very short
  if (company.length <= 2) {
    return company.trim();
  }
  
  return company
    .replace(/\s*\([^)]*\).*$/, '') // Remove everything from first parenthesis
    .replace(/\s*(contacted|reached out|messaged).*$/i, '') // Remove contact notes
    .trim();
}

function cleanJobTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*\([^)]*\).*$/, '') // Remove parenthetical info
    .replace(/\s*(contacted|reached out|messaged).*$/i, '') // Remove contact notes
    .trim();
}

function cleanLocation(location: string): string {
  if (!location) return '';
  return location
    .replace(/(contacted|reached out|messaged).*$/i, '') // Remove contact notes
    .trim();
}

function cleanNotes(notes: string): string {
  if (!notes) return '';
  return notes.trim();
}