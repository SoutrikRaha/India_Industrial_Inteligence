"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const sectors = [
  "All",
  "Energy",
  "Energy Storage",
  "Power & Grid",
  "Mining & Critical Minerals",
  "Metals",
  "Water",
  "CPG",
  "Semiconductors",
];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sector, setSector] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active")
        .order("latest_update_date", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase().trim();

    return projects.filter((p) => {
      const sectorMatch = sector === "All" || p.sector === sector;

      const text = [
        p.company,
        p.project_name,
        p.state,
        p.city,
        p.sector,
        p.stage,
      ]
        .join(" ")
        .toLowerCase();

      return sectorMatch && (!q || text.includes(q));
    });
  }, [projects, sector, search]);

  const totalInvestment = projects.reduce(
    (sum, p) => sum + (p.investment_amount || 0),
    0
  );

  const companies = new Set(projects.map((p) => p.company)).size;
  const trackedSectors = new Set(projects.map((p) => p.sector)).size;

  return (
    <main>
      <header>
        <div className="brand">
          <div className="logo">II</div>
          <div>
            <h1>India Industrial Intelligence</h1>
            <p>Investment & opportunity intelligence</p>
          </div>
        </div>

        <div className="live">LIVE DATABASE</div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">INDIA CAPEX INTELLIGENCE</div>
          <h2>Where industrial money is moving.</h2>
          <p>
            Track industrial investments and material project developments
            across India's major industrial sectors.
          </p>
        </div>
      </section>

      <section className="stats">
        <Stat label="Tracked projects" value={projects.length} />
        <Stat
          label="Disclosed value"
          value={`₹${totalInvestment.toLocaleString("en-IN")} Cr`}
        />
        <Stat label="Companies / investors" value={companies} />
        <Stat label="Sectors tracked" value={trackedSectors} />
      </section>

      <section className="layout">
        <aside>
          <h3>SECTORS</h3>

          {sectors.map((s) => (
            <button
              key={s}
              className={sector === s ? "filter active" : "filter"}
              onClick={() => setSector(s)}
            >
              {s}
              <span>
                {s === "All"
                  ? projects.length
                  : projects.filter((p) => p.sector === s).length}
              </span>
            </button>
          ))}
        </aside>

        <section className="content">
          <input
            className="search"
            placeholder="Search company, project, state, sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="section-title">
            <h3>Material developments</h3>
            <span>{filteredProjects.length} projects</span>
          </div>

          {loading && <div className="message">Loading database...</div>}

          {error && (
            <div className="error">
              Database error: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="cards">
              {filteredProjects.map((p) => (
                <article
                  className="card"
                  key={p.id}
                  onClick={() => setSelected(p)}
                >
                  <div className="sector">{p.sector}</div>

                  <h4>{p.project_name}</h4>

                  <div className="company">
                    {p.company} · {p.location || p.state || "India"}
                  </div>

                  <div className="metrics">
                    <div>
                      <strong>
                        {p.investment_display || "Undisclosed"}
                      </strong>
                      <small>Investment / value</small>
                    </div>

                    <div>
                      <strong>{p.capacity || "—"}</strong>
                      <small>Capacity</small>
                    </div>

                    <div>
                      <strong>{p.stage}</strong>
                      <small>Stage</small>
                    </div>
                  </div>

                  <div className="bottom">
                    <span>{p.latest_update_date}</span>
                    <span className="opportunity">
                      {p.schneider_relevance} Schneider relevance
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="detail" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              Close
            </button>

            <div className="sector">{selected.sector}</div>

            <h2>{selected.project_name}</h2>

            <p className="company">
              {selected.company} · {selected.location}
            </p>

            <div className="detail-grid">
              <Box
                label="Investment / value"
                value={selected.investment_display || "Undisclosed"}
              />
              <Box label="Stage" value={selected.stage} />
              <Box
                label="Capacity / scope"
                value={selected.capacity || selected.scope || "—"}
              />
              <Box
                label="Expected timeline"
                value={selected.expected_timeline || "Undisclosed"}
              />
              <Box
                label="Investment type"
                value={selected.investment_type || "—"}
              />
              <Box
                label="Confidence"
                value={selected.confidence || "—"}
              />
            </div>

            <div className="opportunity-box">
              <h3>Schneider Electric opportunity</h3>

              <div className="tags">
                {(selected.schneider_opportunity || []).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            {selected.verification_note && (
              <div className="note">
                <strong>Verification note</strong>
                <p>{selected.verification_note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function Box({ label, value }) {
  return (
    <div className="box">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
