import { Info, AlertTriangle, Sparkles, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Data-provenance primitives.
 *
 * These components exist to satisfy the platform's Mock/Demo Data Governance
 * and AI Trust Model: anywhere the UI shows numbers or text that are NOT
 * derived from the user's live workspace, the interface must say so clearly.
 */

interface ProvenanceProps {
  className?: string;
}

/** Small inline badge marking a value/section as illustrative sample data. */
export function SampleDataBadge({ className }: ProvenanceProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-warning/40 bg-warning/10 text-warning hover:bg-warning/15",
        className
      )}
      title="Illustrative sample data — not live values from your workspace"
    >
      <Info className="h-3 w-3" />
      Sample data
    </Badge>
  );
}

/** Banner used at the top of a view that is entirely illustrative. */
export function DemoDataBanner({
  message,
  className,
}: ProvenanceProps & { message?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm",
        className
      )}
      role="status"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>
        <p className="font-medium text-warning">Illustrative sample data</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {message ??
            "The figures shown here are placeholder examples, not live data from your workspace. Connect a data source or run demo mode to populate real values."}
        </p>
      </div>
    </div>
  );
}

/** Empty-state callout shown when a query legitimately returns no rows. */
export function EmptyDataState({
  title = "No data yet",
  description,
  className,
}: ProvenanceProps & { title?: string; description?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center",
        className
      )}
    >
      <Database className="h-6 w-6 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {description ??
          "We couldn't find any records in your workspace. Once activity is logged, real metrics will appear here — no placeholder values are shown."}
      </p>
    </div>
  );
}

/** Footnote attached to AI-generated answers to separate them from facts. */
export function AIGeneratedNote({ className }: ProvenanceProps) {
  return (
    <div
      className={cn(
        "mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      AI-generated · not drawn from your connected data
    </div>
  );
}
