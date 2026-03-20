"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Briefcase, Clock, CheckCircle, XCircle, Calendar, Target } from "lucide-react";

interface Stats {
  total: number;
  applied: number;
  interviewing: number;
  accepted: number;
  rejected: number;
}

interface JobTrend {
  month: string;
  applied: number;
  interviewing: number;
  accepted: number;
  rejected: number;
}

interface JobAnalytics {
  averageResponseTime: number;
  successRate: number;
  responseRate: number;
  topCompanies: { company: string; count: number }[];
  topLocations: { location: string; count: number }[];
  monthlyTrends: JobTrend[];
}

const COLORS = {
  applied: '#3b82f6',
  interviewing: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444'
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsResponse, analyticsResponse] = await Promise.all([
          fetch('/api/jobs/stats'),
          fetch('/api/jobs/analytics')
        ]);

        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }

        if (analyticsResponse.ok) {
          setAnalytics(await analyticsResponse.json());
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Insights into your job search progress</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pieData = stats ? [
    { name: 'Applied', value: stats.applied, color: COLORS.applied },
    { name: 'Interviewing', value: stats.interviewing, color: COLORS.interviewing },
    { name: 'Accepted', value: stats.accepted, color: COLORS.accepted },
    { name: 'Rejected', value: stats.rejected, color: COLORS.rejected }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Insights into your job search progress and performance</p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Interviews</p>
                  <p className="text-3xl font-bold text-foreground">{stats.interviewing}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offers Received</p>
                  <p className="text-3xl font-bold text-foreground">{stats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Application Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applied" fill={COLORS.applied} name="Applied" />
                    <Bar dataKey="interviewing" fill={COLORS.interviewing} name="Interviewing" />
                    <Bar dataKey="accepted" fill={COLORS.accepted} name="Accepted" />
                    <Bar dataKey="rejected" fill={COLORS.rejected} name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available yet</p>
                  <p className="text-sm">Start applying to jobs to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.responseRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Interview + Offer rate
                  </p>
                </div>
                <div className="flex items-center">
                  {analytics.responseRate > 20 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.successRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Offer acceptance rate
                  </p>
                </div>
                <div className="flex items-center">
                  {analytics.successRate > 10 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.averageResponseTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Days to hear back
                  </p>
                </div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Companies and Locations */}
      {analytics && (analytics.topCompanies.length > 0 || analytics.topLocations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.topCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCompanies.slice(0, 5).map((company, index) => (
                    <div key={company.company} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{company.company}</span>
                      </div>
                      <Badge variant="secondary">{company.count} applications</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.topLocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topLocations.slice(0, 5).map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{location.location || 'Not specified'}</span>
                      </div>
                      <Badge variant="secondary">{location.count} applications</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}