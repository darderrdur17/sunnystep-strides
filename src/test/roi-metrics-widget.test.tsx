import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ROIMetricsWidget } from "@/components/dashboard/ROIMetricsWidget";

// `fromSpy` lives inside vi.hoisted so it exists before the (also hoisted)
// vi.mock factory runs. We deliberately use the native Date API to build the
// mock rows rather than date-fns, because imports are still in their temporal
// dead zone when the hoisted factory executes.
const { fromSpy } = vi.hoisted(() => ({ fromSpy: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => {
  const today = Date.now();
  const sampleRevenue = Array.from({ length: 7 }, (_, index) => ({
    agent_name: "Campaign Agent",
    date: new Date(today - (6 - index) * 86_400_000).toISOString().slice(0, 10),
    revenue: 12_000 + index * 250,
    conversions: 120 + index * 5,
    actions_taken: 300 + index * 10,
    cost: 1500,
  }));

  fromSpy.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: sampleRevenue, error: null }),
  });

  return {
    supabase: {
      from: fromSpy,
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      })),
      removeChannel: vi.fn(),
    },
  };
});

describe("ROIMetricsWidget", () => {
  it("expands the 7-day breakdown when an agent is clicked", async () => {
    render(<ROIMetricsWidget />);

    const agentRow = await screen.findByText("Campaign Agent");
    fireEvent.click(agentRow);

    const drilldownTitle = await screen.findByText("7-Day Performance Breakdown");
    expect(drilldownTitle).toBeInTheDocument();
    expect(fromSpy).toHaveBeenCalledWith("agent_revenue");
  });
});
