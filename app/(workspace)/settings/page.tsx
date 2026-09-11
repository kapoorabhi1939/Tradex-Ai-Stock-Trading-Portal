import Link from "next/link";
import {
  LogOut,
  ShieldCheck,
  Database,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { getAccount } from "@/lib/workspace";
import { saveProfile } from "@/app/actions/workspace";
import { signOut } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { PageHeading, Panel, SectionTitle, DemoBadge } from "@/components/ui";
import { PlanBadge, UpgradePrompt } from "@/components/product-surfaces";
import { maskedEmail } from "@/lib/format";

export const metadata = { title: "Account" };
export default async function Settings() {
  const data = await getAccount();
  const accountEmail = maskedEmail(data.email);
  return (
    <>
      <PageHeading
        eyebrow="ACCOUNT / YOUR WORKSPACE"
        title="A workspace that’s yours."
        description="Manage your profile, plan, preferences and account security."
      />
      <div className="settings-grid">
        <div className="stack">
          <Panel>
            <SectionTitle title="Profile" sub="How you appear in Tradex" />
            <div className="account-email">
              <span className="avatar">{data.email[0]?.toUpperCase()}</span>
              <div>
                <strong>{data.displayName || accountEmail}</strong>
                <small>{accountEmail}</small>
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
            <SectionTitle title="Plan & billing" sub="Your current access" />
            <div className="current-plan">
              <div>
                <PlanBadge />
                <strong>Tradex Free</strong>
                <p>Market research, watchlist, portfolio and core alerts.</p>
              </div>
              <Link className="button secondary small-button" href="/pricing">
                Compare plans
              </Link>
            </div>
            <UpgradePrompt compact />
          </Panel>
          <Panel>
            <SectionTitle
              title="Session & security"
              sub="This browser session"
            />
            <div className="settings-info">
              <ShieldCheck size={21} />
              <p>Your session is protected by secure account authentication.</p>
            </div>
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
            <SectionTitle title="Preferences" sub="Workspace defaults" />
            <div className="settings-info">
              <SlidersHorizontal size={21} />
              <div>
                <strong>Market preferences</strong>
                <p>
                  United States market focus, USD portfolio valuation and daily
                  research charts.
                </p>
              </div>
            </div>
            <div className="settings-option">
              <div>
                <strong>Alert evaluation</strong>
                <p>Manual, deliberate evaluation from your Alerts workspace.</p>
              </div>
              <span>On request</span>
            </div>
          </Panel>
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
                Tradex AI is a market research and decision-support portal. It
                does not execute trades or provide personalized investment
                advice.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
