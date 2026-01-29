'use client';

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';

interface JobAnalysisResult {
  suitabilityScore: number;
  suitabilityReason: string;
  keyMatches: string[];
  skillGaps: string[];
  coverLetterSuggestions: {
    opening: string;
    bodyPoints: string[];
    closing: string;
  };
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
}

interface JobAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: () => void;
}

export function JobAnalysisModal({ isOpen, onClose, onJobCreated }: JobAnalysisModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze job description');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setJobDescription('');
    setAnalysis(null);
    setError(null);
  };

  const handleCreateJob = async () => {
    if (!analysis || !jobDescription.trim()) {
      setError('Please analyze a job description first');
      return;
    }

    setIsCreatingJob(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs/create-from-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: jobDescription,
          analysis: analysis
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      // Successfully created job
      onJobCreated?.();
      handleClear();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create job. Please try again.');
    } finally {
      setIsCreatingJob(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Job Fit Analyzer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste the complete job posting for the most accurate analysis
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isAnalyzing || !jobDescription.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <SparklesIcon className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Job Fit'}
            </button>
            
            {analysis && (
              <button
                onClick={handleCreateJob}
                disabled={isCreatingJob}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  isCreatingJob
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <PlusIcon className="h-4 w-4" />
                {isCreatingJob ? 'Adding...' : "I've Applied"}
              </button>
            )}
            
            {(jobDescription || analysis) && (
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Fit Score */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Job Fit Score</h3>
                  </div>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-full ${
                    analysis.suitabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                    analysis.suitabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.suitabilityScore}%
                  </div>
                </div>
                <p className="text-gray-700">{analysis.suitabilityReason}</p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Matches */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✅ Key Matches</h4>
                  <ul className="space-y-1">
                    {analysis.keyMatches.map((match, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {match}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skill Gaps */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">⚠️ Areas to Address</h4>
                  <ul className="space-y-1">
                    {analysis.skillGaps.map((gap, index) => (
                      <li key={index} className="text-sm text-orange-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Salary Range */}
              {analysis.salaryRange && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💰 Salary Range</h4>
                  <p className="text-blue-700">
                    {analysis.salaryRange.currency}{analysis.salaryRange.min.toLocaleString()} - {analysis.salaryRange.currency}{analysis.salaryRange.max.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Cover Letter Suggestions */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cover Letter Suggestions</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Opening */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Opening Paragraph</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 italic">{analysis.coverLetterSuggestions.opening}</p>
                    </div>
                  </div>

                  {/* Body Points */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Key Points to Include</h4>
                    <ul className="space-y-2">
                      {analysis.coverLetterSuggestions.bodyPoints.map((point, index) => (
                        <li key={index} className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-700 italic">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Closing */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Closing Paragraph</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 italic">{analysis.coverLetterSuggestions.closing}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements & Responsibilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Requirements</h4>
                  <ul className="space-y-1">
                    {analysis.requirements.slice(0, 8).map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Key Responsibilities</h4>
                  <ul className="space-y-1">
                    {analysis.responsibilities.slice(0, 8).map((resp, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}