import { Job } from './types';

// Predefined company names for consistent obfuscation
const FAKE_COMPANIES = [
  'TechCorp Solutions',
  'InnovateTech Inc',
  'Digital Dynamics',
  'CloudVision Systems',
  'NextGen Software',
  'DataFlow Technologies',
  'CyberCore Industries',
  'SmartTech Ventures',
  'FutureSoft Corporation',
  'ByteStream Solutions',
  'NeuralNet Systems',
  'QuantumCode Labs',
  'AlgoTech Partners',
  'DevStream Inc',
  'CloudScale Solutions',
  'TechFusion Corp',
  'CodeCraft Industries',
  'DataMind Technologies',
  'SoftwarePlus LLC',
  'InnoCore Systems'
];

// Lorem ipsum words for description generation
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'sed', 'ut', 'perspiciatis',
  'unde', 'omnis', 'iste', 'natus', 'error', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae',
  'dicta', 'sunt', 'explicabo', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia'
];

/**
 * Generate a simple hash from a string to ensure consistency
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a fake company name based on job ID for consistency
 */
function generateFakeCompany(jobId: string): string {
  const hash = simpleHash(jobId);
  return FAKE_COMPANIES[hash % FAKE_COMPANIES.length];
}

/**
 * Generate lorem ipsum text of approximately the target length
 */
function generateLoremIpsum(targetLength: number): string {
  if (targetLength === 0) return '';
  
  const words: string[] = [];
  let currentLength = 0;
  let wordIndex = 0;
  
  while (currentLength < targetLength) {
    const word = LOREM_WORDS[wordIndex % LOREM_WORDS.length];
    words.push(word);
    currentLength += word.length + 1; // +1 for space
    wordIndex++;
    
    // Prevent infinite loops
    if (words.length > targetLength / 3) break;
  }
  
  let result = words.join(' ');
  
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  // Add period if it doesn't end with punctuation
  if (!/[.!?]$/.test(result)) {
    result += '.';
  }
  
  return result;
}

/**
 * Obfuscate a single job's sensitive data
 */
export function obfuscateJob(job: Job): Job {
  return {
    ...job,
    company: generateFakeCompany(job.id),
    description: job.description 
      ? generateLoremIpsum(job.description.length)
      : job.description,
  };
}

/**
 * Obfuscate an array of jobs
 */
export function obfuscateJobs(jobs: Job[]): Job[] {
  return jobs.map(obfuscateJob);
}