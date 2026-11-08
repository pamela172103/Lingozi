import { render, screen } from "@testing-library/react";

import { SystemStatusPanel, type SystemStatusLabels } from "./system-status-panel";

const labels: SystemStatusLabels = {
  heading: "Trạng thái hệ thống",
  intro: "intro",
  api: "API",
  database: "Database",
  migrations: "Migration chưa áp dụng",
  checkedAt: "Kiểm tra lúc",
  ok: "Hoạt động",
  unavailable: "Không kết nối được",
  apiUnreachable: "Website không gọi được API.",
  unknown: "Không xác định",
};
const formatTime = (iso: string) => iso;

describe("SystemStatusPanel", () => {
  it("shows database ok with icon text, pending migrations and check time", () => {
    render(
      <SystemStatusPanel
        result={{
          kind: "ok",
          status: { api: "ok", database: "ok", pendingMigrations: 0, checkedAt: "2026-11-08T00:00:00Z" },
        }}
        labels={labels}
        formatTime={formatTime}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Trạng thái hệ thống" })).toBeInTheDocument();
    expect(screen.getByTestId("database-status")).toHaveTextContent("✓ Hoạt động");
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("2026-11-08T00:00:00Z")).toHaveAttribute("datetime", "2026-11-08T00:00:00Z");
  });

  it("shows database unavailable and unknown migration count", () => {
    render(
      <SystemStatusPanel
        result={{
          kind: "ok",
          status: { api: "ok", database: "unavailable", pendingMigrations: null, checkedAt: "2026-11-08T00:00:00Z" },
        }}
        labels={labels}
        formatTime={formatTime}
      />,
    );
    expect(screen.getByTestId("database-status")).toHaveTextContent("✗ Không kết nối được");
    expect(screen.getByText("Không xác định")).toBeInTheDocument();
  });

  it("announces an alert when the API cannot be reached", () => {
    render(<SystemStatusPanel result={{ kind: "api-unreachable" }} labels={labels} formatTime={formatTime} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Website không gọi được API.");
    expect(screen.queryByTestId("database-status")).not.toBeInTheDocument();
  });
});
