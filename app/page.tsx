"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const DASHBOARD_PASSWORD = "ferrarispiderf355";

type TabId = "dashboard" | "projects" | "experiments" | "tasks";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Projects" },
  { id: "experiments", label: "Growth Experiments" },
  { id: "tasks", label: "Calendar" },
];

type Metrics = {
  activeClients: string;
  newThisMonth: string;
  churnThisMonth: string;
  mrr: string;
};

type ProjectTask = {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
};

type Project = {
  id: string;
  name: string;
  owner: string;
  status: string;
  targetDate: string;
  tasks: ProjectTask[];
};

type Experiment = {
  id: string;
  name: string;
  channel: string;
  status: string;
  metric: string;
  notes: string;
};

type DayTask = {
  id: string;
  text: string;
  done: boolean;
};

const LS_WEEKLY_FOCUS_KEY = "ceo_console_weekly_focus";
const LS_METRICS_KEY = "ceo_console_metrics";
const LS_PROJECTS_KEY = "ceo_console_projects";
const LS_EXPERIMENTS_KEY = "ceo_console_experiments";
const LS_CALENDAR_TASKS_KEY = "ceo_console_calendar_tasks";

// weekday: 1 = Monday ... 5 = Friday
const WEEKDAY_DEFAULTS: Record<number, string[]> = {
  1: [
    "Review last week's metrics (leads, sales, churn, ad spend).",
    "Set weekly client target with account manager.",
    "Plan key content pieces for the week.",
    "Check coach capacity + any red-flag clients.",
  ],
  2: [
    "Deep work: write / refine ad scripts & hooks.",
    "Review coach KPIs & feedback.",
    "Record at least 1 TR short-form content piece.",
  ],
  3: [
    "Mid-week metrics review with account manager.",
    "Tweak ad angles / budgets if needed.",
    "Engage with community (DMs, comments, stories).",
  ],
  4: [
    "Deep work: B2B / long-form content planning.",
    "Coach performance review (churn-risk clients).",
    "Plan weekend push (stories / email).",
  ],
  5: [
    "Weekly review: metrics & experiments.",
    "Decide main experiment for next week.",
    "Clean leads list & schedule follow-ups.",
  ],
};

const DEFAULT_WEEKLY_FOCUS = `• 📈 Push Turkey 1–1 from 312 → 350+ this week.
• 🎯 Review ad angles + CPA with partners (Wed 09:30).
• 🧠 Draft 2 B2B YouTube episodes (TR coaches).
• 👥 Coach performance check-in & churn review.`;

const DEFAULT_METRICS: Metrics = {
  activeClients: "312",
  newThisMonth: "54",
  churnThisMonth: "22",
  mrr: "1700000", // ₺
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Scale TR 1–1 to 400 stable",
    owner: "Diren + coaches",
    status: "In progress",
    targetDate: "End of Q2",
    tasks: [
      {
        id: "p1t1",
        text: "Lock weekly KPI format with account manager",
        assignee: "Diren",
        done: false,
      },
      {
        id: "p1t2",
        text: "Define coach capacity + targets",
        assignee: "Diren",
        done: false,
      },
    ],
  },
  {
    id: "p2",
    name: "B2B YouTube channel (TR coaches)",
    owner: "Diren",
    status: "Not started",
    targetDate: "Ongoing",
    tasks: [
      {
        id: "p2t1",
        text: "Outline first 5 episodes",
        assignee: "Diren",
        done: false,
      },
    ],
  },
];

const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: "e1",
    name: "Angle: 'Only 5 women' scarcity",
    channel: "FB Ads",
    status: "Complete",
    metric: "CPA / ROAS",
    notes: "Winner. Use as control. Test new hooks against this.",
  },
  {
    id: "e2",
    name: "Angle: Men 30+ lean for summer",
    channel: "FB Ads",
    status: "Not started",
    metric: "Leads this week",
    notes: "Use 'dad strength', health, energy, family angle.",
  },
  {
    id: "e3",
    name: "Weekly B2B YouTube episode",
    channel: "YouTube TR",
    status: "Not started",
    metric: "Subs / inbound DMs",
    notes: "Authority + trust. No hard sell initially.",
  },
];

const PROJECT_STATUS_OPTIONS = [
  "Not started",
  "In progress",
  "Complete",
] as const;

const EXPERIMENT_STATUS_OPTIONS = [
  "Not started",
  "In progress",
  "Complete",
] as const;

export default function Home() {
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const [weeklyFocus, setWeeklyFocus] = useState(DEFAULT_WEEKLY_FOCUS);
  const [metrics, setMetrics] = useState<Metrics>(DEFAULT_METRICS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [experiments, setExperiments] =
    useState<Experiment[]>(DEFAULT_EXPERIMENTS);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAuth = window.localStorage.getItem("diren_ceo_console_auth");
    if (storedAuth === "1") {
      setAuthorized(true);
    }

    const storedWeekly = window.localStorage.getItem(LS_WEEKLY_FOCUS_KEY);
    if (storedWeekly && storedWeekly.trim().length > 0) {
      setWeeklyFocus(storedWeekly);
    }

    const storedMetrics = window.localStorage.getItem(LS_METRICS_KEY);
    if (storedMetrics) {
      try {
        const parsed = JSON.parse(storedMetrics) as Partial<Metrics>;
        setMetrics({
          activeClients: parsed.activeClients ?? DEFAULT_METRICS.activeClients,
          newThisMonth: parsed.newThisMonth ?? DEFAULT_METRICS.newThisMonth,
          churnThisMonth:
            parsed.churnThisMonth ?? DEFAULT_METRICS.churnThisMonth,
          mrr: parsed.mrr ?? DEFAULT_METRICS.mrr,
        });
      } catch {
        // ignore
      }
    }

    const storedProjects = window.localStorage.getItem(LS_PROJECTS_KEY);
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects) as Project[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      } catch {
        // ignore
      }
    }

    const storedExperiments = window.localStorage.getItem(LS_EXPERIMENTS_KEY);
    if (storedExperiments) {
      try {
        const parsed = JSON.parse(storedExperiments) as Experiment[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExperiments(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_WEEKLY_FOCUS_KEY, weeklyFocus);
  }, [weeklyFocus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_METRICS_KEY, JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      LS_EXPERIMENTS_KEY,
      JSON.stringify(experiments)
    );
  }, [experiments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DASHBOARD_PASSWORD) {
      setAuthorized(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("diren_ceo_console_auth", "1");
      }
    } else {
      alert("Wrong password");
    }
  };

  // LOGIN
  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #1e293b 0, #020617 45%, #000000 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          color: "white",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,47,73,0.98))",
            padding: "32px",
            borderRadius: "20px",
            minWidth: "320px",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(34,197,94,0.25)",
            border: "1px solid rgba(56,189,248,0.35)",
          }}
        >
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>
            Diren CEO Console
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "20px" }}>
            Private control centre for Project 10M.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #1f2937",
                marginBottom: "16px",
                backgroundColor: "#020617",
                color: "white",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #22c55e 0%, #0ea5e9 50%, #22c55e 100%)",
                color: "#020617",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.03em",
              }}
            >
              ENTER CONSOLE
            </button>
          </form>
        </div>
      </main>
    );
  }

  // MAIN APP
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #1e293b 0, #020617 40%, #000000 100%)",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* TOP BAR */}
      <header
        style={{
          padding: "14px 32px",
          borderBottom: "1px solid rgba(30,64,175,0.7)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background:
            "linear-gradient(to right, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              opacity: 0.7,
            }}
          >
            Project 10M
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>
            Diren CEO Console
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("diren_ceo_console_auth");
            }
            setAuthorized(false);
            setPasswordInput("");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.6)",
            backgroundColor: "transparent",
            color: "#e5e7eb",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      {/* TABS */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          padding: "10px 32px 0",
          borderBottom: "1px solid rgba(30,64,175,0.6)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "7px 14px",
              borderRadius: "999px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              background:
                activeTab === tab.id
                  ? "linear-gradient(120deg, #22c55e, #0ea5e9)"
                  : "transparent",
              color: activeTab === tab.id ? "#020617" : "#9ca3af",
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <section
        style={{
          padding: "22px 32px 40px",
          display: "flex",
          gap: "22px",
          alignItems: "flex-start",
        }}
      >
        {activeTab === "dashboard" && (
          <DashboardView
            weeklyFocus={weeklyFocus}
            setWeeklyFocus={setWeeklyFocus}
            metrics={metrics}
            setMetrics={setMetrics}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsView projects={projects} setProjects={setProjects} />
        )}
        {activeTab === "experiments" && (
          <ExperimentsView
            experiments={experiments}
            setExperiments={setExperiments}
          />
        )}
        {activeTab === "tasks" && <CalendarView />}
      </section>
    </main>
  );
}

/* ========= DASHBOARD ========= */

function DashboardView(props: {
  weeklyFocus: string;
  setWeeklyFocus: (val: string) => void;
  metrics: Metrics;
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>;
}) {
  const { weeklyFocus, setWeeklyFocus, metrics, setMetrics } = props;

  return (
    <>
      <div style={{ flex: 2, display: "grid", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <EditableStatCard
            label="Active 1–1 Turkey"
            value={metrics.activeClients}
            onChange={(val) =>
              setMetrics((prev) => ({ ...prev, activeClients: val }))
            }
          />
          <EditableStatCard
            label="New This Month"
            value={metrics.newThisMonth}
            onChange={(val) =>
              setMetrics((prev) => ({ ...prev, newThisMonth: val }))
            }
          />
          <EditableStatCard
            label="Churn This Month"
            value={metrics.churnThisMonth}
            onChange={(val) =>
              setMetrics((prev) => ({ ...prev, churnThisMonth: val }))
            }
          />
          <EditableStatCard
            label="MRR (₺ est.)"
            value={metrics.mrr}
            prefix="₺"
            onChange={(val) =>
              setMetrics((prev) => ({ ...prev, mrr: val }))
            }
          />
        </div>

        <SectionCard title="Weekly Focus (Editable)">
          <textarea
            value={weeklyFocus}
            onChange={(e) => setWeeklyFocus(e.target.value)}
            style={textareaStyle}
          />
          <p
            style={{
              fontSize: "11px",
              opacity: 0.6,
              marginTop: "6px",
            }}
          >
            Bullet points. This auto-saves in this browser.
          </p>
        </SectionCard>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionCard title="Critical Numbers – Daily Check">
          <ul style={listStyle}>
            <li>🧮 New leads last 24h</li>
            <li>📝 New sales last 24h</li>
            <li>❌ Cancellations last 24h</li>
            <li>💰 Ad spend vs revenue yesterday</li>
          </ul>
        </SectionCard>

        <SectionCard title="Pipeline Snapshot">
          <ul style={listStyle}>
            <li>🔥 Hot leads waiting for call / DM</li>
            <li>🧊 Old leads to revive</li>
            <li>📺 Big content pieces in production</li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

/* ========= PROJECTS ========= */

function ProjectsView(props: {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}) {
  const { projects, setProjects } = props;

  const [newName, setNewName] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDate, setNewDate] = useState("");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const handleAddProject = () => {
    if (!newName.trim()) return;

    const id = `p_${Date.now()}`;
    const project: Project = {
      id,
      name: newName.trim(),
      owner: newOwner.trim() || "Diren",
      status: "Not started",
      targetDate: newDate.trim() || "",
      tasks: [],
    };
    setProjects((prev) => [project, ...prev]);

    setNewName("");
    setNewOwner("");
    setNewDate("");
  };

  const updateProjectField = (
    projectId: string,
    field: keyof Project,
    value: string
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              [field]: value,
            }
          : p
      )
    );
  };

  const addTaskToProject = (
    projectId: string,
    text: string,
    assignee: string
  ) => {
    if (!text.trim()) return;
    const id = `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const task: ProjectTask = {
      id,
      text: text.trim(),
      assignee: assignee.trim(),
      done: false,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p
      )
    );
  };

  const toggleTaskDone = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : p
      )
    );
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.filter((t) => t.id !== taskId),
            }
          : p
      )
    );
  };

  const deleteProject = (projectId: string) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (openProjectId === projectId) setOpenProjectId(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Not started":
        return "#9ca3af";
      case "In progress":
        return "#22c55e";
      case "Complete":
        return "#0ea5e9";
      default:
        return "#9ca3af";
    }
  };

  return (
    <>
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionCard title="Add New Project">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 2fr) minmax(0, 1.3fr) minmax(0, 1.3fr) auto",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Owner"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Target date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleAddProject}
              style={primaryButtonSmall}
            >
              + Add
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Projects">
          {projects.length === 0 ? (
            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              No projects yet. Add at least 2–3 that really move revenue.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {projects.map((project) => {
                const statusNormalized = PROJECT_STATUS_OPTIONS.includes(
                  project.status as any
                )
                  ? project.status
                  : "In progress";

                const isOpen = openProjectId === project.id;
                return (
                  <div
                    key={project.id}
                    style={{
                      borderRadius: "14px",
                      border: "1px solid rgba(148,163,184,0.5)",
                      background:
                        "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,47,73,0.97))",
                    }}
                  >
                    <button
                      onClick={() =>
                        setOpenProjectId(isOpen ? null : project.id)
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "none",
                        background: "transparent",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.15s ease",
                          opacity: 0.8,
                        }}
                      >
                        ▶
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          {project.name || "Untitled project"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                          }}
                        >
                          Owner: {project.owner || "—"} • Target:{" "}
                          {project.targetDate || "—"}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          border: `1px solid ${getStatusColor(
                            statusNormalized
                          )}`,
                          color: getStatusColor(statusNormalized),
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {statusNormalized}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: "8px 10px 10px",
                          borderTop: "1px solid rgba(31,41,55,0.9)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            value={project.name}
                            onChange={(e) =>
                              updateProjectField(
                                project.id,
                                "name",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Project name"
                          />
                          <input
                            value={project.owner}
                            onChange={(e) =>
                              updateProjectField(
                                project.id,
                                "owner",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Owner"
                          />
                          <select
                            value={statusNormalized}
                            onChange={(e) =>
                              updateProjectField(
                                project.id,
                                "status",
                                e.target.value
                              )
                            }
                            style={{
                              ...inputStyle,
                              backgroundColor: "rgba(15,23,42,0.95)",
                            }}
                          >
                            {PROJECT_STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                style={{ backgroundColor: "#020617" }}
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          <input
                            value={project.targetDate}
                            onChange={(e) =>
                              updateProjectField(
                                project.id,
                                "targetDate",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Target date"
                          />
                        </div>

                        <ProjectTasksSection
                          project={project}
                          addTask={addTaskToProject}
                          toggleTask={toggleTaskDone}
                          deleteTask={deleteTask}
                        />

                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => deleteProject(project.id)}
                            style={dangerButtonTiny}
                          >
                            Delete project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ flex: 1 }}>
        <SectionCard title="How to Use Projects">
          <ul style={listStyle}>
            <li>Each line here = one big lever for revenue / brand.</li>
            <li>Keep statuses honest: Not started / In progress / Complete.</li>
            <li>Use tasks only for the next 3–5 key moves.</li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function ProjectTasksSection(props: {
  project: Project;
  addTask: (projectId: string, text: string, assignee: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
}) {
  const { project, addTask, toggleTask, deleteTask } = props;
  const [taskText, setTaskText] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");

  const handleAddTask = () => {
    addTask(project.id, taskText, taskAssignee);
    setTaskText("");
    setTaskAssignee("");
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr) auto",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <input
          placeholder="New task"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Assignee (optional)"
          value={taskAssignee}
          onChange={(e) => setTaskAssignee(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleAddTask} style={secondaryButtonSmall}>
          + Task
        </button>
      </div>

      {project.tasks.length === 0 ? (
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          No tasks yet. Add the key moves only.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {project.tasks.map((task) => (
            <li
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(project.id, task.id)}
              />
              <span
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                  opacity: task.done ? 0.6 : 1,
                  flex: 1,
                }}
              >
                {task.text}
                {task.assignee && (
                  <span style={{ opacity: 0.6 }}> — {task.assignee}</span>
                )}
              </span>
              <button
                onClick={() => deleteTask(project.id, task.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#f97373",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ========= EXPERIMENTS ========= */

function ExperimentsView(props: {
  experiments: Experiment[];
  setExperiments: React.Dispatch<React.SetStateAction<Experiment[]>>;
}) {
  const { experiments, setExperiments } = props;

  const [newName, setNewName] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [newStatus, setNewStatus] = useState("Not started");
  const [newMetric, setNewMetric] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [openExperimentId, setOpenExperimentId] = useState<string | null>(null);

  const handleAddExperiment = () => {
    if (!newName.trim()) return;

    const id = `e_${Date.now()}`;
    const exp: Experiment = {
      id,
      name: newName.trim(),
      channel: newChannel.trim() || "FB Ads",
      status: newStatus.trim() || "Not started",
      metric: newMetric.trim() || "Leads / sales",
      notes: newNotes.trim(),
    };
    setExperiments((prev) => [exp, ...prev]);

    setNewName("");
    setNewChannel("");
    setNewStatus("Not started");
    setNewMetric("");
    setNewNotes("");
  };

  const updateExperimentField = (
    id: string,
    field: keyof Experiment,
    value: string
  ) => {
    setExperiments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const deleteExperiment = (id: string) => {
    setExperiments((prev) => prev.filter((e) => e.id !== id));
    if (openExperimentId === id) setOpenExperimentId(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Not started":
        return "#9ca3af";
      case "In progress":
        return "#22c55e";
      case "Complete":
        return "#0ea5e9";
      default:
        return "#9ca3af";
    }
  };

  return (
    <>
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionCard title="Add New Experiment">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 2fr) minmax(0, 1.3fr) minmax(0, 1.1fr) minmax(0, 1.3fr)",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <input
              placeholder="Experiment (e.g. 'Angle: Men 30+ lean for summer')"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Channel (FB Ads, IG, YT...)"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              style={inputStyle}
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                ...inputStyle,
                backgroundColor: "rgba(15,23,42,0.95)",
              }}
            >
              {EXPERIMENT_STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  style={{ backgroundColor: "#020617" }}
                >
                  {opt}
                </option>
              ))}
            </select>
            <input
              placeholder="Main metric (CPA, ROAS, leads...)"
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
              style={inputStyle}
            />
          </div>
          <textarea
            placeholder="Notes / creative ideas / script bullets..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            style={textareaStyleSmall}
          />
          <div style={{ marginTop: "8px" }}>
            <button onClick={handleAddExperiment} style={primaryButtonSmall}>
              + Add experiment
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Experiments">
          {experiments.length === 0 ? (
            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              No experiments yet. Add 3–5 angles you want to test soon.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {experiments.map((exp) => {
                const statusNormalized = EXPERIMENT_STATUS_OPTIONS.includes(
                  exp.status as any
                )
                  ? exp.status
                  : "In progress";

                const isOpen = openExperimentId === exp.id;

                return (
                  <div
                    key={exp.id}
                    style={{
                      borderRadius: "14px",
                      border: "1px solid rgba(148,163,184,0.5)",
                      background:
                        "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,47,73,0.97))",
                    }}
                  >
                    <button
                      onClick={() =>
                        setOpenExperimentId(isOpen ? null : exp.id)
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "none",
                        background: "transparent",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.15s ease",
                          opacity: 0.8,
                        }}
                      >
                        ▶
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        >
                          {exp.name || "Untitled experiment"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                          }}
                        >
                          {exp.channel || "—"} • Metric:{" "}
                          {exp.metric || "Leads / sales"}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          border: `1px solid ${getStatusColor(
                            statusNormalized
                          )}`,
                          color: getStatusColor(statusNormalized),
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {statusNormalized}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: "8px 10px 10px",
                          borderTop: "1px solid rgba(31,41,55,0.9)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.1fr) minmax(0, 1.3fr)",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <input
                            value={exp.name}
                            onChange={(e) =>
                              updateExperimentField(
                                exp.id,
                                "name",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Experiment"
                          />
                          <input
                            value={exp.channel}
                            onChange={(e) =>
                              updateExperimentField(
                                exp.id,
                                "channel",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Channel"
                          />
                          <select
                            value={statusNormalized}
                            onChange={(e) =>
                              updateExperimentField(
                                exp.id,
                                "status",
                                e.target.value
                              )
                            }
                            style={{
                              ...inputStyle,
                              backgroundColor: "rgba(15,23,42,0.95)",
                            }}
                          >
                            {EXPERIMENT_STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                style={{ backgroundColor: "#020617" }}
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          <input
                            value={exp.metric}
                            onChange={(e) =>
                              updateExperimentField(
                                exp.id,
                                "metric",
                                e.target.value
                              )
                            }
                            style={inputStyle}
                            placeholder="Metric"
                          />
                        </div>
                        <textarea
                          value={exp.notes}
                          onChange={(e) =>
                            updateExperimentField(
                              exp.id,
                              "notes",
                              e.target.value
                            )
                          }
                          style={textareaStyleTiny}
                          placeholder="Notes / hooks / audiences / script bullets..."
                        />
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => deleteExperiment(exp.id)}
                            style={dangerButtonTiny}
                          >
                            Delete experiment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ flex: 1 }}>
        <SectionCard title="How to Use Experiments">
          <ul style={listStyle}>
            <li>Each line = one angle / offer test.</li>
            <li>Status: Not started → In progress → Complete.</li>
            <li>Use notes as scratchpad for hooks, scripts, targeting.</li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

/* ========= CALENDAR + MODAL ========= */

function CalendarView() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasksByDate, setTasksByDate] = useState<Record<string, DayTask[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LS_CALENDAR_TASKS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, DayTask[]>;
        setTasksByDate(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  // Autosave
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      LS_CALENDAR_TASKS_KEY,
      JSON.stringify(tasksByDate)
    );
  }, [tasksByDate]);

  const formatKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingWeekday = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Date[] = [];

    // days from previous month
    for (let i = startingWeekday; i > 0; i--) {
      cells.push(new Date(year, month, 1 - i));
    }

    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }

    // next month fill to 6x7 grid
    while (cells.length < 42) {
      const last = cells[cells.length - 1];
      cells.push(
        new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
      );
    }

    return cells;
  };

  const cells = getMonthDays();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const monthName = currentMonth.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const openDayModal = (dateObj: Date) => {
    const key = formatKey(dateObj);
    const weekday = dateObj.getDay(); // 0 = Sunday, 1 = Monday...

    setTasksByDate((prev) => {
      const existing = prev[key];
      if (existing && existing.length > 0) {
        // already has tasks → don't overwrite
        return prev;
      }

      const defaults = WEEKDAY_DEFAULTS[weekday];
      if (!defaults || defaults.length === 0) {
        // weekend or no defaults → leave empty
        return prev;
      }

      const baselineTasks: DayTask[] = defaults.map((text, index) => ({
        id: `baseline_${key}_${index}`,
        text,
        done: false,
      }));

      return {
        ...prev,
        [key]: baselineTasks,
      };
    });

    setSelectedDate(dateObj);
    setNewTaskText("");
    setIsModalOpen(true);
  };

  const addTaskForSelectedDay = () => {
    if (!selectedDate) return;
    if (!newTaskText.trim()) return;

    const key = formatKey(selectedDate);
    const id = `day_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const newTask: DayTask = {
      id,
      text: newTaskText.trim(),
      done: false,
    };

    setTasksByDate((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: [...arr, newTask],
      };
    });

    setNewTaskText("");
  };

  const toggleTask = (taskId: string) => {
    if (!selectedDate) return;
    const key = formatKey(selectedDate);

    setTasksByDate((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
      };
    });
  };

  const deleteTask = (taskId: string) => {
    if (!selectedDate) return;
    const key = formatKey(selectedDate);

    setTasksByDate((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.filter((t) => t.id !== taskId),
      };
    });
  };

  const moveTaskToTomorrow = (taskId: string) => {
    if (!selectedDate) return;

    const todayKey = formatKey(selectedDate);
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = formatKey(tomorrow);

    setTasksByDate((prev) => {
      const todayArr = prev[todayKey] || [];
      const task = todayArr.find((t) => t.id === taskId);
      if (!task) return prev;

      const updatedToday = todayArr.filter((t) => t.id !== taskId);
      const tomorrowArr = prev[tomorrowKey] || [];

      return {
        ...prev,
        [todayKey]: updatedToday,
        [tomorrowKey]: [...tomorrowArr, { ...task }],
      };
    });
  };

  const dayLabel =
    selectedDate &&
    selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const selectedTasks: DayTask[] =
    selectedDate && tasksByDate[formatKey(selectedDate)]
      ? tasksByDate[formatKey(selectedDate)]
      : [];

  return (
    <>
      <div style={{ flex: 1 }}>
        <SectionCard title="Calendar – Weekly Deliverables">
          {/* Month header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => changeMonth(-1)}
                style={squareButton}
                type="button"
              >
                ‹
              </button>
              <span>{monthName}</span>
              <button
                onClick={() => changeMonth(1)}
                style={squareButton}
                type="button"
              >
                ›
              </button>
            </div>
            <button
              type="button"
              style={secondaryButtonSmall}
              onClick={() => {
                const today = new Date();
                setCurrentMonth(
                  new Date(today.getFullYear(), today.getMonth(), 1)
                );
              }}
            >
              This month
            </button>
          </div>

          {/* Weekday labels */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              fontSize: "11px",
              textAlign: "center",
              opacity: 0.7,
              marginBottom: "4px",
            }}
          >
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
            }}
          >
            {cells.map((dateObj, idx) => {
              const inCurrentMonth =
                dateObj.getMonth() === currentMonth.getMonth();
              const key = formatKey(dateObj);
              const tasksForDay = tasksByDate[key] || [];
              const isToday = isSameDay(dateObj, new Date());
              const isSelected =
                selectedDate && isSameDay(dateObj, selectedDate);

              return (
                <button
                  key={`${key}_${idx}`}
                  type="button"
                  onClick={() => openDayModal(dateObj)}
                  style={{
                    borderRadius: "10px",
                    padding: "4px 4px 6px",
                    border: isSelected
                      ? "1px solid rgba(56,189,248,0.9)"
                      : "1px solid rgba(31,41,55,0.9)",
                    backgroundColor: isSelected
                      ? "rgba(15,23,42,0.95)"
                      : "rgba(15,23,42,0.9)",
                    color: inCurrentMonth ? "#e5e7eb" : "#6b7280",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                    minHeight: "46px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? "#22c55e" : undefined,
                      }}
                    >
                      {dateObj.getDate()}
                    </span>
                    {tasksForDay.length > 0 && (
                      <span
                        style={{
                          fontSize: "9px",
                          padding: "1px 5px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(34,197,94,0.1)",
                          color: "#22c55e",
                        }}
                      >
                        {tasksForDay.length}
                      </span>
                    )}
                  </div>
                  {/* dot if any open tasks */}
                  {tasksForDay.some((t) => !t.done) && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "999px",
                        backgroundColor: "#22c55e",
                        marginTop: 2,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p
            style={{
              fontSize: "11px",
              opacity: 0.6,
              marginTop: "10px",
            }}
          >
            Click a day to open a focused view. Weekday defaults pre-fill what a
            CEO should do by day. Add / edit as you like.
          </p>
        </SectionCard>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedDate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: "min(480px, 90vw)",
              maxHeight: "80vh",
              overflow: "hidden",
              borderRadius: "18px",
              border: "1px solid rgba(56,189,248,0.6)",
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(8,47,73,0.99))",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(34,197,94,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(37,99,235,0.7)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                  }}
                >
                  Day Plan
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>
                  {dayLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  backgroundColor: "transparent",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            {/* Modal content */}
            <div
              style={{
                padding: "12px 16px 14px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.8fr) auto",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add task (e.g. 'Review ad performance')"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addTaskForSelectedDay}
                  style={secondaryButtonSmall}
                >
                  + Add
                </button>
              </div>

              {selectedTasks.length === 0 ? (
                <p style={{ fontSize: "12px", opacity: 0.7 }}>
                  No tasks yet for this day. Add what matters most.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {selectedTasks.map((task) => (
                    <li
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "13px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span
                        style={{
                          textDecoration: task.done ? "line-through" : "none",
                          opacity: task.done ? 0.6 : 1,
                          flex: 1,
                        }}
                      >
                        {task.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveTaskToTomorrow(task.id)}
                        style={{
                          border: "none",
                          backgroundColor: "rgba(59,130,246,0.15)",
                          color: "#bfdbfe",
                          borderRadius: "999px",
                          padding: "3px 8px",
                          fontSize: "10px",
                          cursor: "pointer",
                        }}
                      >
                        → Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#f97373",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <p
                style={{
                  fontSize: "11px",
                  opacity: 0.6,
                  marginTop: "10px",
                }}
              >
                Weekday defaults are your baseline CEO habits. Add your extra
                deep work, content blocks, calls, etc. here.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========= SMALL COMPONENTS / STYLES ========= */

function EditableStatCard(props: {
  label: string;
  value: string;
  prefix?: string;
  onChange: (val: string) => void;
}) {
  const { label, value, prefix, onChange } = props;
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(8,47,73,0.98))",
        borderRadius: "14px",
        padding: "14px",
        border: "1px solid rgba(56,189,248,0.45)",
        boxShadow:
          "0 20px 40px rgba(15,23,42,0.9), 0 0 30px rgba(34,197,94,0.25)",
      }}
    >
      <div style={{ fontSize: "11px", opacity: 0.75, marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        {prefix && (
          <span style={{ fontSize: "16px", opacity: 0.85 }}>{prefix}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            borderBottom: "1px dashed rgba(148,163,184,0.7)",
            color: "white",
            fontSize: "24px",
            width: "100%",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function SectionCard(props: { title: string; children: React.ReactNode }) {
  const { title, children } = props;
  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(8,47,73,0.98))",
        borderRadius: "18px",
        padding: "18px 18px 16px",
        border: "1px solid rgba(37,99,235,0.65)",
        boxShadow:
          "0 18px 40px rgba(15,23,42,0.85), 0 0 30px rgba(56,189,248,0.25)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          marginBottom: "10px",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  backgroundColor: "rgba(15,23,42,0.9)",
  borderRadius: "8px",
  border: "1px solid rgba(148,163,184,0.5)",
  padding: "6px 8px",
  color: "white",
  fontSize: "13px",
  outline: "none",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "130px",
  backgroundColor: "rgba(15,23,42,0.9)",
  color: "white",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.5)",
  padding: "10px",
  fontSize: "14px",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
  resize: "vertical",
  whiteSpace: "pre-wrap",
};

const textareaStyleSmall: CSSProperties = {
  ...textareaStyle,
  minHeight: "80px",
};

const textareaStyleTiny: CSSProperties = {
  ...textareaStyle,
  minHeight: "60px",
  fontSize: "13px",
};

const listStyle: CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  margin: 0,
  paddingLeft: "18px",
};

const primaryButtonSmall: CSSProperties = {
  padding: "7px 12px",
  borderRadius: "999px",
  border: "none",
  background:
    "linear-gradient(135deg, #22c55e 0%, #0ea5e9 50%, #22c55e 100%)",
  color: "#020617",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const secondaryButtonSmall: CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 500,
};

const dangerButtonTiny: CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  border: "1px solid #b91c1c",
  backgroundColor: "transparent",
  color: "#fecaca",
  fontSize: "10px",
  cursor: "pointer",
};

const squareButton: CSSProperties = {
  borderRadius: "8px",
  border: "1px solid rgba(148,163,184,0.6)",
  backgroundColor: "rgba(15,23,42,0.9)",
  color: "#e5e7eb",
  fontSize: "12px",
  width: "26px",
  height: "24px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};