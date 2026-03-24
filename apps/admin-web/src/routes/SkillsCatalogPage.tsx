import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getInvalidHandymenSkills,
  getSkillsCatalogFlat,
  patchSkillsCatalog,
  replaceSkillsCatalog,
  type InvalidHandymanSkillsResponse,
  type SkillCatalogFlatResponse,
} from "@smart/api";
import { useAdminApiClient, useActionBusy } from "../lib/api";
import { safeJsonParse } from "../lib/adminFormat";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Page from "../ui/Page";

const defaultPatchJson = JSON.stringify(
  {
    upserts: {},
    activate_skills: [],
    deactivate_skills: [],
    activate_categories: [],
    deactivate_categories: [],
  },
  null,
  2
);

const defaultReplaceJson = JSON.stringify(
  {
    catalog: {},
  },
  null,
  2
);

export default function SkillsCatalogPage() {
  const api = useAdminApiClient();
  const [patchJson, setPatchJson] = useState(defaultPatchJson);
  const [replaceJson, setReplaceJson] = useState(defaultReplaceJson);
  const { busy, is, run } = useActionBusy();

  const catalogQ = useQuery({
    queryKey: ["skills-catalog-flat"],
    queryFn: () => getSkillsCatalogFlat(api, { active_only: false }),
  });

  const invalidQ = useQuery({
    queryKey: ["invalid-handyman-skills"],
    queryFn: () => getInvalidHandymenSkills(api),
  });

  const catalog = catalogQ.data as SkillCatalogFlatResponse | undefined;
  const invalid = invalidQ.data as InvalidHandymanSkillsResponse | undefined;

  async function onPatch() {
    await run("patch", async () => {
      await patchSkillsCatalog(api, safeJsonParse(patchJson));
      await catalogQ.refetch();
      await invalidQ.refetch();
    });
  }

  async function onReplace() {
    const ok = window.confirm("Replace the whole skills catalog?");
    if (!ok) return;
    await run("replace", async () => {
      await replaceSkillsCatalog(api, safeJsonParse(replaceJson));
      await catalogQ.refetch();
      await invalidQ.refetch();
    });
  }

  return (
    <Page title="Skills Catalog" subtitle="Inspect catalog structure and apply admin patch/replace actions">
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1.2fr 0.8fr" }}>
        <Card title="Catalog">
          <div style={{ display: "grid", gap: 12 }}>
            {(catalog?.categories ?? []).map((category) => (
              <div
                key={category.key}
                className="app-panel"
                style={{
                  padding: 14,
                  background: "var(--surface)",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, color: "var(--text)" }}>{category.label}</div>
                  <Badge label={category.active ? "active" : "inactive"} tone={category.active ? "success" : "neutral"} />
                  <span style={{ color: "var(--text-faint)", fontSize: 13 }}>{category.key}</span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {category.skills.map((skill) => (
                    <div
                      key={skill.key}
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface-muted)",
                        borderRadius: 999,
                        padding: "8px 10px",
                        fontSize: 13,
                        color: "var(--text)",
                      }}
                    >
                      <strong>{skill.label}</strong> · {skill.key} ·{" "}
                      <span style={{ color: skill.active ? "var(--success)" : "var(--text-faint)" }}>
                        {skill.active ? "active" : "inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gap: 12 }}>
          <Card title="Patch catalog">
            <div style={{ display: "grid", gap: 10 }}>
              <textarea
                value={patchJson}
                onChange={(e) => setPatchJson(e.target.value)}
                rows={14}
                style={{ resize: "vertical" }}
              />
              <button onClick={onPatch} disabled={busy} className="app-button app-button-primary">
                {is("patch") ? "Applying patch…" : "Apply patch"}
              </button>
            </div>
          </Card>

          <Card title="Replace catalog">
            <div style={{ display: "grid", gap: 10 }}>
              <textarea
                value={replaceJson}
                onChange={(e) => setReplaceJson(e.target.value)}
                rows={10}
                style={{ resize: "vertical" }}
              />
              <button onClick={onReplace} disabled={busy} className="app-button app-button-warning">
                {is("replace") ? "Replacing…" : "Replace catalog"}
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <Card title="Invalid handyman skills" right={invalid ? `${invalid.count} item(s)` : undefined}>
        {invalid?.items?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {invalid.items.map((item) => (
              <div
                key={item.email}
                className="app-panel"
                style={{
                  padding: 14,
                  background: "var(--surface)",
                }}
              >
                <div style={{ fontWeight: 800, color: "var(--text)" }}>{item.email}</div>
                <div style={{ marginTop: 8, color: "var(--text-faint)" }}>
                  Invalid: {item.invalid_skills.join(", ") || "-"}
                </div>
                <div style={{ marginTop: 4, color: "var(--text-faint)" }}>
                  Valid: {item.valid_skills.join(", ") || "-"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "var(--text-faint)" }}>No invalid handyman skills found.</div>
        )}
      </Card>
    </Page>
  );
}