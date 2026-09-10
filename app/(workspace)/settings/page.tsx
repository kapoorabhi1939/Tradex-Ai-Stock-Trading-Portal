import { LogOut, ShieldCheck, Database, Info } from "lucide-react";
import { getWorkspace } from "@/lib/workspace";
import { saveProfile } from "@/app/actions/workspace";
import { signOut } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { PageHeading, Panel, SectionTitle, DemoBadge } from "@/components/ui";
import { DATASET_VERSION } from "@/lib/demo-market";
export const metadata = { title: "Settings" };
export default async function Settings() {
  const data = await getWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="SETTINGS / YOUR WORKSPACE"
        title="A workspace that’s yours."
        description="Manage your profile and understand how Tradex AI works."
      />
      <div className="settings-grid">
        <div className="stack">
          <Panel>
            <SectionTitle title="Your account" />
            <div className="account-email">
              <span className="avatar">{data.email[0]?.toUpperCase()}</span>
              <div>
                <strong>{data.email}</strong>
                <small>Authenticated with Supabase</small>
              </div>
            </div>
            <ActionForm
              action={saveProfile}
              label="Save profile"
              className="profile-form"
            >
              <label>
                Display name
                <input
                  name="display_name"
                  maxLength={60}
                  required
                  defaultValue={data.displayName ?? ""}
                  placeholder="How should we greet you?"
                  autoComplete="nickname"
                />
              </label>
            </ActionForm>
          </Panel>
          <Panel>
            <SectionTitle
              title="Session"
              sub="Sign out of this browser. Your saved research remains in your account."
            />
            <ActionForm
              action={signOut}
              label={
                <>
                  <LogOut size={16} /> Sign out
                </>
              }
              pendingLabel="Signing out…"
              buttonClass="secondary"
            />
          </Panel>
        </div>
        <div className="stack">
          <Panel>
            <SectionTitle title="Data & methodology" />
            <div className="settings-info">
              <Database size={21} />
              <div>
                <DemoBadge />
                <p>
                  12 US equities with fixed, seeded price histories. Headlines
                  and sentiment are synthetic.
                </p>
                <code>{DATASET_VERSION}</code>
              </div>
            </div>
            <div className="settings-info">
              <ShieldCheck size={21} />
              <p>
                Signals use weighted momentum, moving averages, and seeded
                sentiment. Confidence is adjusted for historical volatility and
                is not a calibrated probability.
              </p>
            </div>
          </Panel>
          <Panel>
            <SectionTitle
              title="About Tradex AI"
              sub="Functional demonstration · Baseline model v1"
            />
            <div className="settings-info">
              <Info size={21} />
              <p>
                Tradex AI is an equity research and decision-support portal. It
                does not execute trades or provide personalized investment
                advice. Portfolio scores are educational risk proxies; they
                cannot predict future losses or returns.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
