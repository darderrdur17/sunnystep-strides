import { motion } from "framer-motion";
import { Mail, MessageSquare, Globe, TrendingUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SampleDataBadge } from "@/components/DataProvenance";

export interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "web";
  status: "active" | "scheduled" | "completed";
  sent: number;
  openRate: number;
  conversionRate: number;
  revenue: string;
}

/** Fallback illustrative campaigns — only shown when no live data exists. */
const sampleCampaigns: Campaign[] = [
  {
    id: "1",
    name: "CNY Dream Collection Launch",
    type: "email",
    status: "active",
    sent: 12450,
    openRate: 42.3,
    conversionRate: 8.7,
    revenue: "$24,560",
  },
  {
    id: "2",
    name: "Abandoned Cart Recovery",
    type: "email",
    status: "active",
    sent: 3280,
    openRate: 58.2,
    conversionRate: 15.4,
    revenue: "$18,920",
  },
  {
    id: "3",
    name: "Win-Back: 60-Day Inactive",
    type: "sms",
    status: "active",
    sent: 1890,
    openRate: 89.5,
    conversionRate: 6.2,
    revenue: "$8,340",
  },
  {
    id: "4",
    name: "VIP Membership Welcome",
    type: "email",
    status: "completed",
    sent: 856,
    openRate: 67.8,
    conversionRate: 22.1,
    revenue: "$12,480",
  },
];

const typeIcons = {
  email: Mail,
  sms: MessageSquare,
  web: Globe,
};

const statusStyles = {
  active: "bg-success/15 text-success",
  scheduled: "bg-warning/15 text-warning",
  completed: "bg-muted text-muted-foreground",
};

export function CampaignList({
  campaigns,
}: {
  /** When omitted, illustrative sample campaigns are shown (clearly labeled). */
  campaigns?: Campaign[];
}) {
  const isSample = !campaigns || campaigns.length === 0;
  const rows = isSample ? sampleCampaigns : campaigns!;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-foreground">
              {isSample ? "Recent Campaigns" : "Active Campaigns"}
            </h3>
            {isSample && <SampleDataBadge />}
          </div>
          <p className="text-sm text-muted-foreground">
            {isSample
              ? "Illustrative sample — connect data to see your campaigns"
              : "AI-managed marketing campaigns"}
          </p>
        </div>
        <button className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Sent</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Open Rate</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Conversion</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Revenue</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((campaign, index) => {
              const Icon = typeIcons[campaign.type];
              return (
                <motion.tr
                  key={campaign.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        statusStyles[campaign.status]
                      )}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-foreground">
                    {campaign.sent.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-medium text-foreground">{campaign.openRate}%</span>
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-foreground">
                    {campaign.conversionRate}%
                  </td>
                  <td className="px-5 py-4 text-right font-display font-semibold text-success">
                    {campaign.revenue}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="rounded-lg p-1.5 transition-colors hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
