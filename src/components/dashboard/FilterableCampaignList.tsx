import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Globe, 
  TrendingUp, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  X,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CampaignCreator } from "./CampaignCreator";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  sent_count: number;
  open_rate: number;
  conversion_rate: number;
  revenue: number;
  agent_name: string | null;
  start_date: string | null;
  end_date: string | null;
}

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  web: Globe,
};

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success",
  scheduled: "bg-warning/15 text-warning",
  completed: "bg-muted text-muted-foreground",
  draft: "bg-info/15 text-info",
};

export function FilterableCampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    
    setCampaigns(data || []);
    setLoading(false);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Search filter
      if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && campaign.status !== statusFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== "all" && campaign.type !== typeFilter) {
        return false;
      }
      
      // Date range filter
      if (dateRange?.from && campaign.start_date) {
        const startDate = new Date(campaign.start_date);
        if (startDate < dateRange.from) return false;
        if (dateRange.to && startDate > dateRange.to) return false;
      }
      
      return true;
    });
  }, [campaigns, searchQuery, statusFilter, typeFilter, dateRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange(undefined);
  };

  const hasFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all" || dateRange;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Campaigns</h3>
            <p className="text-sm text-muted-foreground">
              {filteredCampaigns.length} of {campaigns.length} campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchCampaigns}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <CampaignCreator onCampaignCreated={fetchCampaigns} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Campaign</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Agent</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Sent</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Open Rate</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Conversion</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Revenue</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </td>
              </tr>
            ) : filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  No campaigns found matching your filters
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((campaign, index) => {
                const Icon = typeIcons[campaign.type] || Mail;
                return (
                  <motion.tr
                    key={campaign.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground block">{campaign.name}</span>
                          {campaign.start_date && (
                            <span className="text-xs text-muted-foreground">
                              Started {format(new Date(campaign.start_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        statusStyles[campaign.status] || statusStyles.draft
                      )}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {campaign.agent_name || "-"}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">
                      {campaign.sent_count.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-medium text-foreground">{campaign.open_rate}%</span>
                        {campaign.open_rate > 40 && <TrendingUp className="w-3.5 h-3.5 text-success" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">
                      {campaign.conversion_rate}%
                    </td>
                    <td className="px-5 py-4 text-right font-display font-semibold text-success">
                      ${campaign.revenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
