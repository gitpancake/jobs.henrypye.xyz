"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Briefcase, Clock, CheckCircle, Calendar, Target, Send, MessageCircle } from "lucide-react";

type Granularity = "day" | "week" | "month";

const METHOD_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  PHONE: 'Phone',
  TEXT: 'Text',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
  IN_PERSON: 'In Person',
  EMAIL: 'Email',
  OTHER: 'Other',
};

const METHOD_COLORS: Record<string, string> = {
  LINKEDIN: '#3b82f6',
  PHONE: '#10b981',
  TEXT: '#a855f7',
  WHATSAPP: '#059669',
  TELEGRAM: '#0ea5e9',
  IN_PERSON: '#f59e0b',
  EMAIL: '#6366f1',
  OTHER: '#6b7280',
};

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

interface OutreachStats {
  total: number;
  responded: number;
  responseRate: number;
  byMethod: { method: string; count: number }[];
  monthlyTrends: { month: string; total: number; responded: number }[];
}

const JOB_COLORS = {
  applied: '#3b82f6',
  interviewing: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444'
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [outreachStats, setOutreachStats] = useState<OutreachStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>("month");

  const fetchTrends = useCallback(async (g: Granularity) => {
    const [analyticsRes, outreachRes] = await Promise.all([
      fetch(`/api/jobs/analytics?granularity=${g}`),
      fetch(`/api/outreach/stats?granularity=${g}`),
    ]);
    if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    if (outreachRes.ok) setOutreachStats(await outreachRes.json());
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsRes, analyticsRes, outreachRes] = await Promise.all([
          fetch('/api/jobs/stats'),
          fetch(`/api/jobs/analytics?granularity=${granularity}`),
          fetch(`/api/outreach/stats?granularity=${granularity}`),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (outreachRes.ok) setOutreachStats(await outreachRes.json());
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGranularityChange = useCallback((value: string) => {
    if (!value) return;
    const g = value as Granularity;
    setGranularity(g);
    fetchTrends(g);
  }, [fetchTrends]);

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
    { name: 'Applied', value: stats.applied, color: JOB_COLORS.applied },
    { name: 'Interviewing', value: stats.interviewing, color: JOB_COLORS.interviewing },
    { name: 'Accepted', value: stats.accepted, color: JOB_COLORS.accepted },
    { name: 'Rejected', value: stats.rejected, color: JOB_COLORS.rejected }
  ].filter(item => item.value > 0) : [];

  const outreachPieData = outreachStats?.byMethod
    .filter((m) => m.count > 0)
    .map((m) => ({
      name: METHOD_LABELS[m.method] || m.method,
      value: m.count,
      color: METHOD_COLORS[m.method] || '#6b7280',
    })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Insights into your job search progress and performance</p>
      </div>

      {/* Key Metrics */}
      {(stats || outreachStats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applications</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Interviews</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Offers</p>
                      <p className="text-3xl font-bold text-foreground">{stats.accepted}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {outreachStats && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outreach Sent</p>
                      <p className="text-3xl font-bold text-foreground">{outreachStats.total}</p>
                    </div>
                    <Send className="h-8 w-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outreach Replies</p>
                      <p className="text-3xl font-bold text-foreground">
                        {outreachStats.responded}
                        <span className="text-lg text-muted-foreground font-normal ml-1">
                          ({outreachStats.responseRate.toFixed(0)}%)
                        </span>
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Application Trends
            </CardTitle>
            <ToggleGroup
              type="single"
              value={granularity}
              onValueChange={handleGranularityChange}
              size="sm"
            >
              <ToggleGroupItem value="day" className="text-xs px-2.5">Day</ToggleGroupItem>
              <ToggleGroupItem value="week" className="text-xs px-2.5">Week</ToggleGroupItem>
              <ToggleGroupItem value="month" className="text-xs px-2.5">Month</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            {analytics?.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={granularity === 'day' ? -45 : 0}
                      textAnchor={granularity === 'day' ? 'end' : 'middle'}
                      height={granularity === 'day' ? 60 : 30}
                      tick={{ fontSize: granularity === 'day' ? 10 : 12 }}
                      interval={granularity === 'day' ? 2 : 0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applied" fill={JOB_COLORS.applied} name="Applied" />
                    <Bar dataKey="interviewing" fill={JOB_COLORS.interviewing} name="Interviewing" />
                    <Bar dataKey="accepted" fill={JOB_COLORS.accepted} name="Accepted" />
                    <Bar dataKey="rejected" fill={JOB_COLORS.rejected} name="Rejected" />
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

      {/* Outreach Section */}
      {outreachStats && outreachStats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outreach Trends */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Outreach Trends
              </CardTitle>
              <ToggleGroup
                type="single"
                value={granularity}
                onValueChange={handleGranularityChange}
                size="sm"
              >
                <ToggleGroupItem value="day" className="text-xs px-2.5">Day</ToggleGroupItem>
                <ToggleGroupItem value="week" className="text-xs px-2.5">Week</ToggleGroupItem>
                <ToggleGroupItem value="month" className="text-xs px-2.5">Month</ToggleGroupItem>
              </ToggleGroup>
            </CardHeader>
            <CardContent>
              {outreachStats.monthlyTrends.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outreachStats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        angle={granularity === 'day' ? -45 : 0}
                        textAnchor={granularity === 'day' ? 'end' : 'middle'}
                        height={granularity === 'day' ? 60 : 30}
                        tick={{ fontSize: granularity === 'day' ? 10 : 12 }}
                        interval={granularity === 'day' ? 2 : 0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#6366f1" name="Sent" />
                      <Bar dataKey="responded" fill="#10b981" name="Responded" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No outreach data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outreach by Method */}
          <Card>
            <CardHeader>
              <CardTitle>By Method</CardTitle>
            </CardHeader>
            <CardContent>
              {outreachPieData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outreachPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {outreachPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No outreach data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
