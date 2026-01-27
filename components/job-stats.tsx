'use client';

interface JobStatsProps {
  stats: {
    total: number;
    applied: number;
    interviewing: number;
    accepted: number;
    rejected: number;
  };
}

export function JobStats({ stats }: JobStatsProps) {
  const successRate = stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : '0.0';
  const responseRate = stats.total > 0 ? (((stats.interviewing + stats.accepted) / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Applications</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
        <div className="text-sm text-gray-600">Applied</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.interviewing}</div>
        <div className="text-sm text-gray-600">Interviewing</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
        <div className="text-sm text-gray-600">Accepted</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        <div className="text-sm text-gray-600">Rejected</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-lg font-bold text-green-600">{successRate}%</div>
        <div className="text-xs text-gray-600">Success Rate</div>
        <div className="text-lg font-bold text-blue-600 mt-1">{responseRate}%</div>
        <div className="text-xs text-gray-600">Response Rate</div>
      </div>
    </div>
  );
}