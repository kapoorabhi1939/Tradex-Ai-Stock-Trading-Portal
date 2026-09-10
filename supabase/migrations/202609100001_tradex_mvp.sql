-- Apply once in the Supabase SQL editor or with the Supabase CLI.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.watchlists (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80), created_at timestamptz not null default now(),
  unique(user_id,name), unique(id,user_id)
);
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  watchlist_id uuid not null, ticker text not null,
  created_at timestamptz not null default now(), unique(watchlist_id,ticker),
  foreign key(watchlist_id,user_id) references public.watchlists(id,user_id) on delete cascade,
  check (ticker in ('AAPL','NVDA','MSFT','AMZN','TSLA','META','GOOGL','JPM','JNJ','XOM','PG','CAT'))
);
create table public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null check (ticker in ('AAPL','NVDA','MSFT','AMZN','TSLA','META','GOOGL','JPM','JNJ','XOM','PG','CAT')),
  shares numeric(20,6) not null check (shares > 0 and shares <= 100000000),
  average_cost numeric(18,6) not null check (average_cost >= 0 and average_cost <= 1000000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,ticker)
);
create table public.alert_rules (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null check (ticker in ('AAPL','NVDA','MSFT','AMZN','TSLA','META','GOOGL','JPM','JNJ','XOM','PG','CAT')),
  condition_type text not null check (condition_type in ('price_above','price_below','confidence_above','confidence_below','signal_bullish','signal_bearish')),
  threshold numeric, enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,user_id,ticker),
  unique nulls not distinct(user_id,ticker,condition_type,threshold),
  check (
    (condition_type in ('signal_bullish','signal_bearish') and threshold is null) or
    (condition_type in ('price_above','price_below') and threshold is not null and threshold between 0 and 1000000) or
    (condition_type in ('confidence_above','confidence_below') and threshold is not null and threshold between 0 and 100)
  )
);
create table public.triggered_alerts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  alert_rule_id uuid not null, ticker text not null, trigger_value numeric not null,
  message text not null check (char_length(message) between 1 and 1000),
  dataset_version text not null check (char_length(dataset_version) between 1 and 80), triggered_at timestamptz not null default now(),
  foreign key(alert_rule_id,user_id,ticker) references public.alert_rules(id,user_id,ticker) on delete cascade,
  unique(alert_rule_id,dataset_version)
);
create index watchlist_items_user on public.watchlist_items(user_id);
create index alert_rules_user on public.alert_rules(user_id,enabled);
create index triggered_alerts_user_time on public.triggered_alerts(user_id,triggered_at desc);

create function public.tradex_touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.tradex_touch_updated_at();
create trigger holdings_updated before update on public.portfolio_holdings for each row execute function public.tradex_touch_updated_at();
create trigger rules_updated before update on public.alert_rules for each row execute function public.tradex_touch_updated_at();

alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.alert_rules enable row level security;
alter table public.triggered_alerts enable row level security;
create policy profiles_owner on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy watchlists_owner on public.watchlists for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy watchlist_items_owner on public.watchlist_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy holdings_owner on public.portfolio_holdings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy rules_owner on public.alert_rules for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy triggered_read on public.triggered_alerts for select to authenticated using ((select auth.uid()) = user_id);
create policy triggered_insert on public.triggered_alerts for insert to authenticated with check ((select auth.uid()) = user_id);
revoke all on public.profiles, public.watchlists, public.watchlist_items, public.portfolio_holdings, public.alert_rules, public.triggered_alerts from anon;
grant select,insert,update,delete on public.profiles, public.watchlists, public.watchlist_items, public.portfolio_holdings, public.alert_rules to authenticated;
grant select,insert on public.triggered_alerts to authenticated;
revoke update,delete on public.triggered_alerts from authenticated;
commit;
