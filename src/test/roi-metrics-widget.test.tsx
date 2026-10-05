import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { startOfDay, subDays, formatISO } from "date-fns";
import { ROIMetricsWidget } from "@/components/dashboard/ROIMetricsWidget";

const today = startOfDay(new Date());
const sampleRevenue = Array.from({ length: 7 }, (_, index) => ({
  agent_name: "Campaign Agent",
  date: formatISO(subDays(today, 6 - index), { representation: "date" }),
  revenue: 12000 + index * 250,
  conversions: 120 + index * 5,
  actions_taken: 300 + index * 10,
  cost: 1500,
}));

const mockFrom = vi.fn(() => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: sampleRevenue, error: null }),
  };
  return chain;
});

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockFrom,
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

describe("ROIMetricsWidget", () => {
  it("expands the 7-day breakdown when an agent is clicked", async () => {
    render(<ROIMetricsWidget />);

    const agentRow = await screen.findByText("Campaign Agent");
    fireEvent.click(agentRow);

    const drilldownTitle = await screen.findByText("7-Day Performance Breakdown");
    expect(drilldownTitle).toBeInTheDocument();
    expect(mockFrom).toHaveBeenCalledWith("agent_revenue");
  });
});
