"use client";

import { useState, useEffect } from "react";
import {
    XMarkIcon,
    LightBulbIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { RejectionInsightsResult } from "@/lib/types";

interface RejectionInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RejectionInsightsModal({
    isOpen,
    onClose,
}: RejectionInsightsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<RejectionInsightsResult | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !insights && !isLoading) {
            fetchInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/jobs/rejection-insights", {
                method: "POST",
                signal: AbortSignal.timeout(120000),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to analyze rejection patterns",
                );
            }

            const result = await response.json();
            setInsights(result);
        } catch (error) {
            if (error instanceof Error && error.name === "TimeoutError") {
                setError("Analysis timed out. Please try again.");
            } else {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Analysis failed. Please try again.",
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setInsights(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                        <LightBulbIcon className="h-6 w-6 text-amber-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Rejection Insights
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <SparklesIcon className="h-8 w-8 text-purple-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">
                                Analyzing your rejected applications...
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Finding patterns across your rejections
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={fetchInsights}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {insights && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <LightBulbIcon className="h-5 w-5 text-amber-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Summary
                                    </h3>
                                    <span className="text-sm text-gray-500 ml-auto">
                                        {insights.jobsAnalyzed} roles analyzed
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    {insights.summary}
                                </p>
                            </div>

                            {/* Common Requirements */}
                            {insights.commonRequirements.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-3">
                                        Most Common Requirements
                                    </h4>
                                    <p className="text-xs text-blue-600 mb-3">
                                        Skills and qualifications that appeared
                                        most frequently across your rejected
                                        roles
                                    </p>
                                    <ul className="space-y-1">
                                        {insights.commonRequirements.map(
                                            (req, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-blue-700 flex items-start"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    {req}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Skill Gaps */}
                            {insights.skillGaps.length > 0 && (
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-800 mb-3">
                                        Likely Skill Gaps
                                    </h4>
                                    <p className="text-xs text-orange-600 mb-3">
                                        Areas where your profile may not match
                                        what these roles were looking for
                                    </p>
                                    <ul className="space-y-1">
                                        {insights.skillGaps.map(
                                            (gap, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-orange-700 flex items-start"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    {gap}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Patterns */}
                            {insights.patterns.length > 0 && (
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-800 mb-3">
                                        Patterns Noticed
                                    </h4>
                                    <ul className="space-y-1">
                                        {insights.patterns.map(
                                            (pattern, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-purple-700 flex items-start"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    {pattern}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Recommendations */}
                            {insights.recommendations.length > 0 && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold text-green-800 mb-3">
                                        Recommendations
                                    </h4>
                                    <p className="text-xs text-green-600 mb-3">
                                        Actionable steps to improve your success
                                        rate
                                    </p>
                                    <ul className="space-y-2">
                                        {insights.recommendations.map(
                                            (rec, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-green-700 flex items-start"
                                                >
                                                    <span className="text-green-600 mr-2 font-medium">
                                                        {index + 1}.
                                                    </span>
                                                    <span>{rec}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
