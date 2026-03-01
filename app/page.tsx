
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "40px" }}>
        Diren CEO Console
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "20px",
        }}
      >
        <DashboardCard title="Active Clients" value="312" />
        <DashboardCard title="New This Month" value="54" />
        <DashboardCard title="Churn This Month" value="22" />
        <DashboardCard title="MRR (£)" value="£27,500" />
      </div>
    </main>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ opacity: 0.7, fontSize: "14px" }}>{title}</h3>
      <p style={{ fontSize: "28px", marginTop: "10px" }}>{value}</p>
    </div>
  );
}
