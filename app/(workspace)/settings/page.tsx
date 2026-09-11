import { LogOut, ShieldCheck, Database, Info } from "lucide-react";
import { getWorkspace } from "@/lib/workspace";
import { saveProfile } from "@/app/actions/workspace";
import { signOut } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { PageHeading, Panel, SectionTitle, DemoBadge } from "@/components/ui";

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
                <small>Secure workspace account</small>
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
            <SectionTitle title="Market information" />
            <div className="settings-info">
              <Database size={21} />
              <div>
                <DemoBadge />
                <p>
                  Quotes and daily price histories come from our connected
                  market-data service. Availability and timing vary by
                  instrument.
                </p>
              </div>
            </div>
            <div className="settings-info">
              <ShieldCheck size={21} />
              <p>
                Tradex Signal uses price momentum, moving-average trends and
                historical volatility. The score is a technical indicator, not a
                probability of profit.
              </p>
            </div>
          </Panel>
          <Panel>
            <SectionTitle
              title="About Tradex AI"
              sub="Research and portfolio workspace"
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
