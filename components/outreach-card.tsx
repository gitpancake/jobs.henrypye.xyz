'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Outreach, OutreachMethod } from '@/lib/types';
import { ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const METHOD_LABELS: Record<OutreachMethod, string> = {
  LINKEDIN: 'LinkedIn',
  PHONE: 'Phone',
  TEXT: 'Text',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
  IN_PERSON: 'In Person',
  EMAIL: 'Email',
  OTHER: 'Other',
};

const METHOD_COLORS: Record<OutreachMethod, string> = {
  LINKEDIN: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  PHONE: 'bg-green-500/15 text-green-600 dark:text-green-300 border-green-500/30',
  TEXT: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  WHATSAPP: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  TELEGRAM: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  IN_PERSON: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  EMAIL: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  OTHER: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

export { METHOD_LABELS, METHOD_COLORS };

export const OutreachCard = memo(function OutreachCard({ outreach }: { outreach: Outreach }) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => router.push(`/outreach/${outreach.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{outreach.contactName}</h3>
              {outreach.contactTitle && (
                <span className="text-sm text-muted-foreground">({outreach.contactTitle})</span>
              )}
              <Badge variant="outline" className={METHOD_COLORS[outreach.method]}>
                {METHOD_LABELS[outreach.method]}
              </Badge>
            </div>

            <p className="text-foreground font-medium mb-1">{outreach.company}</p>

            {outreach.bio && (
              <p className="text-muted-foreground/80 dark:text-muted-foreground text-sm mb-1 hidden sm:block">
                {outreach.bio.length > 150
                  ? `${outreach.bio.substring(0, 150)}...`
                  : outreach.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Reached out: {format(new Date(outreach.outreachDate), 'MMM d, yyyy')}</span>
              <span className={`flex items-center gap-1 ${outreach.responded ? 'text-green-600 dark:text-green-300' : ''}`}>
                {outreach.responded ? (
                  <><CheckCircle2 className="h-3.5 w-3.5" /> Responded</>
                ) : (
                  <><Clock className="h-3.5 w-3.5" /> No response</>
                )}
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
});
