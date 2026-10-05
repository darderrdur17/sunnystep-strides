import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { SampleDataBadge } from "@/components/DataProvenance";

interface Variant {
  id: string;
  variant_name: string;
  is_control: boolean;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: string;
  test_type: string;
  start_date: string;
  end_date: string | null;
  winning_variant: string | null;
  confidence_level: number;
  variants?: Variant[];
}

// Statistical significance calculation (simplified z-test)
function calculateSignificance(control: Variant, variant: Variant): number {
  if (control.impressions === 0 || variant.impressions === 0) return 0;
  
  const p1 = control.conversions / control.impressions;
  const p2 = variant.conversions / variant.impressions;
  const n1 = control.impressions;
  const n2 = variant.impressions;
  
  const pooledP = (control.conversions + variant.conversions) / (n1 + n2);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  
  if (se === 0) return 0;
  
  const z = Math.abs(p2 - p1) / se;
  
  // Convert z-score to confidence level (approximation)
  if (z >= 2.576) return 99;
  if (z >= 1.96) return 95;
  if (z >= 1.645) return 90;
  if (z >= 1.282) return 80;
  return Math.min(z / 1.282 * 80, 79);
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 95) return "text-success bg-success/15";
  if (confidence >= 90) return "text-warning bg-warning/15";
  return "text-muted-foreground bg-muted";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "running":
      return <Clock className="w-4 h-4 text-primary animate-pulse" />;
    default:
      return <AlertCircle className="w-4 h-4 text-warning" />;
  }
}

// Demo data for when database is empty
const demoTests: ABTest[] = [
  {
    id: "1",
    name: "CNY Email Subject Line Test",
    description: "Testing different subject lines for Chinese New Year campaign",
    status: "completed",
    test_type: "email",
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    winning_variant: "Variant B",
    confidence_level: 97.2,
    variants: [
      { id: "1a", variant_name: "Control", is_control: true, impressions: 15000, conversions: 1200, conversion_rate: 8.0, revenue: 24000 },
      { id: "1b", variant_name: "Variant A", is_control: false, impressions: 15000, conversions: 1380, conversion_rate: 9.2, revenue: 27600 },
      { id: "1c", variant_name: "Variant B", is_control: false, impressions: 15000, conversions: 1650, conversion_rate: 11.0, revenue: 33000 },
    ]
  },
  {
    id: "2",
    name: "Cart Reminder Timing Test",
    description: "Testing optimal timing for abandoned cart reminders",
    status: "running",
    test_type: "email",
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: null,
    winning_variant: null,
    confidence_level: 82.5,
    variants: [
      { id: "2a", variant_name: "1 Hour", is_control: true, impressions: 3200, conversions: 384, conversion_rate: 12.0, revenue: 7680 },
      { id: "2b", variant_name: "4 Hours", is_control: false, impressions: 3200, conversions: 448, conversion_rate: 14.0, revenue: 8960 },
      { id: "2c", variant_name: "24 Hours", is_control: false, impressions: 3200, conversions: 320, conversion_rate: 10.0, revenue: 6400 },
    ]
  },
  {
    id: "3",
    name: "Welcome Series CTA Button",
    description: "Testing CTA button colors and text for welcome emails",
    status: "completed",
    test_type: "email",
    start_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    winning_variant: "Coral + Action Text",
    confidence_level: 99.1,
    variants: [
      { id: "3a", variant_name: "Blue + Shop Now", is_control: true, impressions: 8500, conversions: 595, conversion_rate: 7.0, revenue: 11900 },
      { id: "3b", variant_name: "Coral + Action Text", is_control: false, impressions: 8500, conversions: 935, conversion_rate: 11.0, revenue: 18700 },
    ]
  }
];

export function ABTestResults() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    const { data: testsData, error } = await supabase
      .from("ab_tests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !testsData || testsData.length === 0) {
      // Use demo data
      setTests(demoTests);
      setUsingDemo(true);
    } else {
      // Fetch variants for each test
      const testsWithVariants = await Promise.all(
        testsData.map(async (test) => {
          const { data: variants } = await supabase
            .from("ab_test_variants")
            .select("*")
            .eq("test_id", test.id);
          return { ...test, variants: variants || [] };
        })
      );
      setTests(testsWithVariants.length > 0 ? testsWithVariants : demoTests);
      setUsingDemo(testsWithVariants.length === 0);
    }
    setLoading(false);
  };

  const getWinningVariant = (test: ABTest): Variant | null => {
    if (!test.variants || test.variants.length === 0) return null;
    return test.variants.reduce((best, current) => 
      current.conversion_rate > best.conversion_rate ? current : best
    );
  };

  const getControlVariant = (test: ABTest): Variant | null => {
    if (!test.variants) return null;
    return test.variants.find(v => v.is_control) || test.variants[0];
  };

  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-foreground">A/B Test Results</h2>
            {usingDemo && <SampleDataBadge />}
          </div>
          <p className="text-muted-foreground">Statistical analysis of marketing experiments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/15 text-success text-sm">
            <Trophy className="w-4 h-4" />
            <span>{tests.filter(t => t.status === "completed").length} Completed</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-sm">
            <Clock className="w-4 h-4" />
            <span>{tests.filter(t => t.status === "running").length} Running</span>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {tests.map((test, index) => {
          const winner = getWinningVariant(test);
          const control = getControlVariant(test);
          const isExpanded = expandedTest === test.id;
          const confidence = test.confidence_level || (control && winner ? calculateSignificance(control, winner) : 0);
          const lift = control && winner 
            ? ((winner.conversion_rate - control.conversion_rate) / control.conversion_rate * 100).toFixed(1)
            : "0";

          return (
            <motion.div
              key={test.id}
              className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Test Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedTest(isExpanded ? null : test.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      test.status === "completed" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                    )}>
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-foreground">{test.name}</h3>
                        {getStatusIcon(test.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Confidence Badge */}
                    <div className="text-center">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-semibold",
                        getConfidenceColor(confidence)
                      )}>
                        {confidence.toFixed(1)}% Confidence
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {confidence >= 95 ? "Statistically Significant" : "Needs more data"}
                      </p>
                    </div>

                    {/* Lift Indicator */}
                    {test.status === "completed" && winner && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-display font-bold text-lg">+{lift}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Conversion Lift</p>
                      </div>
                    )}

                    <button className="p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Winner Banner */}
                {test.status === "completed" && winner && (
                  <motion.div 
                    className="mt-4 p-3 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-success" />
                      <span className="font-medium text-foreground">Winner: {winner.variant_name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({winner.conversion_rate.toFixed(1)}% conversion rate, ${winner.revenue.toLocaleString()} revenue)
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && test.variants && (
                <motion.div
                  className="border-t border-border p-5 bg-secondary/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="space-y-4">
                    {test.variants.map((variant, vIndex) => {
                      const isWinner = winner && variant.id === winner.id;
                      const maxConversions = Math.max(...test.variants!.map(v => v.conversions));
                      
                      return (
                        <motion.div
                          key={variant.id}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            isWinner 
                              ? "border-success/50 bg-success/5" 
                              : variant.is_control 
                                ? "border-primary/30 bg-primary/5" 
                                : "border-border bg-card"
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: vIndex * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                isWinner 
                                  ? "bg-success/15 text-success" 
                                  : variant.is_control 
                                    ? "bg-primary/15 text-primary" 
                                    : "bg-muted text-muted-foreground"
                              )}>
                                {isWinner ? "🏆 Winner" : variant.is_control ? "Control" : "Variant"}
                              </span>
                              <h4 className="font-medium text-foreground">{variant.variant_name}</h4>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <p className="font-display font-bold text-foreground">{variant.impressions.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Impressions</p>
                              </div>
                              <div className="text-center">
                                <p className="font-display font-bold text-foreground">{variant.conversions.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Conversions</p>
                              </div>
                              <div className="text-center">
                                <p className={cn(
                                  "font-display font-bold",
                                  isWinner ? "text-success" : "text-foreground"
                                )}>
                                  {variant.conversion_rate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Conv. Rate</p>
                              </div>
                              <div className="text-center">
                                <p className="font-display font-bold text-foreground">${variant.revenue.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Conversion Progress</span>
                              <span>{((variant.conversions / maxConversions) * 100).toFixed(0)}% of best</span>
                            </div>
                            <Progress 
                              value={(variant.conversions / maxConversions) * 100} 
                              className={cn(
                                "h-2",
                                isWinner && "[&>div]:bg-success"
                              )}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Statistical Analysis */}
                  {control && winner && control.id !== winner.id && (
                    <div className="mt-4 p-4 rounded-lg bg-info/10 border border-info/20">
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-info" />
                        Statistical Analysis
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sample Size</p>
                          <p className="font-medium text-foreground">
                            {(test.variants?.reduce((sum, v) => sum + v.impressions, 0) || 0).toLocaleString()} total
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Absolute Lift</p>
                          <p className="font-medium text-success">
                            +{(winner.conversion_rate - control.conversion_rate).toFixed(2)}pp
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Relative Lift</p>
                          <p className="font-medium text-success">+{lift}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
