-- =============================================================================
--  GRAINE — Schéma de base de données (Supabase / PostgreSQL)
-- -----------------------------------------------------------------------------
--  Concept : récompenser par des bons d'achat (vouchers) dans des magasins
--  éthiques (merchants) les utilisateurs (profiles) qui réalisent des gestes
--  écologiques (eco_gestures). Les magasins scannent leurs clients (scans).
--
--  À coller tel quel dans : Supabase > SQL Editor > New query > Run.
--  Idempotent autant que possible (drop ... if exists) — relançable.
-- =============================================================================

-- crypt()/gen_salt() (création du compte admin) viennent de pgcrypto.
-- Sur Supabase l'extension vit dans le schéma `extensions` (on qualifie les appels).
-- gen_random_uuid() est, lui, natif depuis PostgreSQL 13 (pas besoin d'extension).
create extension if not exists pgcrypto with schema extensions;

-- =============================================================================
--  1. TYPES ÉNUMÉRÉS
-- =============================================================================
do $$ begin
  create type public.member_role     as enum ('owner', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gesture_category as enum ('transport', 'energy', 'consumption', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gesture_status   as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.voucher_status   as enum ('active', 'redeemed', 'expired');
exception when duplicate_object then null; end $$;

-- =============================================================================
--  2. TABLES
-- =============================================================================

-- --- 2.1 Profils (identité « perso », 1:1 avec auth.users) --------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  full_name   text,
  avatar_url  text,
  is_admin    boolean not null default false,
  level       integer not null default 1,
  xp          integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Profil personnel de chaque utilisateur authentifié.';

-- --- 2.2 Paliers de niveau (table de référence) ------------------------------
create table if not exists public.levels (
  level        integer primary key,
  xp_required  integer not null,
  title        text
);

-- --- 2.3 Gestes écologiques (source de vérité du CO2 et des gestes) -----------
create table if not exists public.eco_gestures (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  category      public.gesture_category not null,
  label         text not null,
  co2_saved_kg  numeric(10,2) not null default 0,
  distance_km   numeric(10,2),
  xp_earned     integer not null default 0,
  status        public.gesture_status not null default 'verified',
  document_url  text,                         -- justificatif / facture
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists idx_eco_gestures_user on public.eco_gestures(user_id);
create index if not exists idx_eco_gestures_date on public.eco_gestures(occurred_at);

-- --- 2.4 Marchands / comptes pro (magasins éthiques) -------------------------
create table if not exists public.merchants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  category    text,
  logo_url    text,
  promo_code  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- --- 2.5 Association utilisateur <-> marchand (le lien « perso/pro ») ---------
--  Un user peut gérer 0, 1 ou plusieurs marchands ; un marchand peut avoir
--  plusieurs membres. C'est ce qui rend les comptes « associés (ou pas) ».
create table if not exists public.merchant_members (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         public.member_role not null default 'owner',
  created_at   timestamptz not null default now(),
  unique (merchant_id, user_id)
);
create index if not exists idx_members_user on public.merchant_members(user_id);
create index if not exists idx_members_merchant on public.merchant_members(merchant_id);

-- --- 2.6 Points de vente physiques (pour la carte « Explorer ») --------------
create table if not exists public.stores (
  id           uuid primary key default gen_random_uuid(),
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  name         text not null,
  address      text,
  latitude     double precision,
  longitude    double precision,
  created_at   timestamptz not null default now()
);
create index if not exists idx_stores_merchant on public.stores(merchant_id);

-- --- 2.7 Offres / réductions proposées par un marchand ----------------------
create table if not exists public.offers (
  id               uuid primary key default gen_random_uuid(),
  merchant_id      uuid not null references public.merchants(id) on delete cascade,
  title            text not null,
  description      text,
  discount_percent integer not null check (discount_percent between 0 and 100),
  promo_code       text,
  accent_color     text,
  valid_from       timestamptz,
  valid_until      timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists idx_offers_merchant on public.offers(merchant_id);
create index if not exists idx_offers_active on public.offers(is_active);

-- --- 2.8 Bons d'achat gagnés par un utilisateur (la récompense) --------------
create table if not exists public.vouchers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  merchant_id  uuid not null references public.merchants(id) on delete cascade,
  offer_id     uuid references public.offers(id) on delete set null,
  code         text not null unique,
  status       public.voucher_status not null default 'active',
  earned_at    timestamptz not null default now(),
  redeemed_at  timestamptz,
  expires_at   timestamptz
);
create index if not exists idx_vouchers_user on public.vouchers(user_id);
create index if not exists idx_vouchers_merchant on public.vouchers(merchant_id);
create index if not exists idx_vouchers_status on public.vouchers(status);

-- --- 2.9 Scans (un marchand scanne un client = transaction) ------------------
--  customer_id peut être null (client non inscrit) ; on stocke donc un
--  instantané (customer_name / avatar) pour garder un historique stable même
--  si l'utilisateur change de pseudo ou supprime son compte.
create table if not exists public.scans (
  id                  uuid primary key default gen_random_uuid(),
  merchant_id         uuid not null references public.merchants(id) on delete cascade,
  store_id            uuid references public.stores(id) on delete set null,
  customer_id         uuid references public.profiles(id) on delete set null,
  cashier_id          uuid references public.profiles(id) on delete set null,
  offer_id            uuid references public.offers(id) on delete set null,
  voucher_id          uuid references public.vouchers(id) on delete set null,
  customer_name       text,
  customer_avatar     text,
  discount_percent    integer,
  price_before        numeric(10,2),
  price_after         numeric(10,2),
  used_promo_code     boolean not null default false,
  co2_saved_kg        numeric(10,2) not null default 0,
  invoice_url         text,                   -- Facture PDF
  scanned_at          timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index if not exists idx_scans_merchant on public.scans(merchant_id);
create index if not exists idx_scans_customer on public.scans(customer_id);
create index if not exists idx_scans_date on public.scans(scanned_at);

-- =============================================================================
--  3. TRIGGERS UTILITAIRES
-- =============================================================================

-- 3.1 updated_at automatique
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_merchants_updated on public.merchants;
create trigger trg_merchants_updated before update on public.merchants
  for each row execute function public.set_updated_at();

-- 3.2 Création automatique du profil (et du marchand si compte pro) à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username    text;
  v_merchant_id uuid;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  -- Pseudo unique : on suffixe avec un fragment d'UUID en cas de collision.
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '-' || substr(new.id::text, 1, 6);
  end if;

  insert into public.profiles (id, username, full_name, avatar_url, is_admin)
  values (
    new.id,
    v_username,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );

  -- Compte pro : on provisionne le marchand + l'appartenance « owner ».
  if coalesce(new.raw_user_meta_data->>'account_type', 'perso') = 'pro' then
    insert into public.merchants (name, slug, category, promo_code)
    values (
      coalesce(new.raw_user_meta_data->>'business_name', v_username),
      lower(regexp_replace(coalesce(new.raw_user_meta_data->>'business_name', v_username), '[^a-zA-Z0-9]+', '-', 'g'))
        || '-' || substr(new.id::text, 1, 8),
      new.raw_user_meta_data->>'business_category',
      new.raw_user_meta_data->>'promo_code'
    )
    returning id into v_merchant_id;

    insert into public.merchant_members (merchant_id, user_id, role)
    values (v_merchant_id, new.id, 'owner');
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
--  4. FONCTIONS D'AIDE POUR LES POLICIES (security definer → pas de récursion RLS)
-- =============================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.owns_merchant(p_merchant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.merchant_members
    where merchant_id = p_merchant and user_id = auth.uid()
  );
$$;

-- Un pro peut-il voir ce client ? (= il a scanné ce client au moins une fois)
create or replace function public.has_scanned(p_customer uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.scans s
    join public.merchant_members mm on mm.merchant_id = s.merchant_id
    where s.customer_id = p_customer and mm.user_id = auth.uid()
  );
$$;

-- =============================================================================
--  5. ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles         enable row level security;
alter table public.levels           enable row level security;
alter table public.eco_gestures     enable row level security;
alter table public.merchants        enable row level security;
alter table public.merchant_members enable row level security;
alter table public.stores           enable row level security;
alter table public.offers           enable row level security;
alter table public.vouchers         enable row level security;
alter table public.scans            enable row level security;

-- --- profiles ---------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin() or public.has_scanned(id));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- --- levels (catalogue public en lecture) -----------------------------------
drop policy if exists levels_select on public.levels;
create policy levels_select on public.levels for select using (true);

-- --- eco_gestures (privé : le propriétaire + admin) -------------------------
drop policy if exists gestures_all on public.eco_gestures;
create policy gestures_all on public.eco_gestures for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- --- merchants (catalogue public en lecture, écriture par owner/admin) ------
drop policy if exists merchants_select on public.merchants;
create policy merchants_select on public.merchants for select using (true);

drop policy if exists merchants_write on public.merchants;
create policy merchants_write on public.merchants for all
  using (public.owns_merchant(id) or public.is_admin())
  with check (public.owns_merchant(id) or public.is_admin());

-- --- merchant_members -------------------------------------------------------
drop policy if exists members_select on public.merchant_members;
create policy members_select on public.merchant_members for select
  using (user_id = auth.uid() or public.owns_merchant(merchant_id) or public.is_admin());

drop policy if exists members_write on public.merchant_members;
create policy members_write on public.merchant_members for all
  using (public.owns_merchant(merchant_id) or public.is_admin())
  with check (public.owns_merchant(merchant_id) or public.is_admin());

-- --- stores (lecture publique, écriture owner/admin) ------------------------
drop policy if exists stores_select on public.stores;
create policy stores_select on public.stores for select using (true);

drop policy if exists stores_write on public.stores;
create policy stores_write on public.stores for all
  using (public.owns_merchant(merchant_id) or public.is_admin())
  with check (public.owns_merchant(merchant_id) or public.is_admin());

-- --- offers (lecture publique, écriture owner/admin) ------------------------
drop policy if exists offers_select on public.offers;
create policy offers_select on public.offers for select using (true);

drop policy if exists offers_write on public.offers;
create policy offers_write on public.offers for all
  using (public.owns_merchant(merchant_id) or public.is_admin())
  with check (public.owns_merchant(merchant_id) or public.is_admin());

-- --- vouchers ---------------------------------------------------------------
drop policy if exists vouchers_select on public.vouchers;
create policy vouchers_select on public.vouchers for select
  using (user_id = auth.uid() or public.owns_merchant(merchant_id) or public.is_admin());

drop policy if exists vouchers_insert on public.vouchers;
create policy vouchers_insert on public.vouchers for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists vouchers_update on public.vouchers;
create policy vouchers_update on public.vouchers for update
  using (user_id = auth.uid() or public.owns_merchant(merchant_id) or public.is_admin())
  with check (user_id = auth.uid() or public.owns_merchant(merchant_id) or public.is_admin());

-- --- scans (le client concerné, le marchand, ou l'admin) --------------------
drop policy if exists scans_select on public.scans;
create policy scans_select on public.scans for select
  using (customer_id = auth.uid() or public.owns_merchant(merchant_id) or public.is_admin());

drop policy if exists scans_write on public.scans;
create policy scans_write on public.scans for all
  using (public.owns_merchant(merchant_id) or public.is_admin())
  with check (public.owns_merchant(merchant_id) or public.is_admin());

-- =============================================================================
--  6. VUES D'AGRÉGATS (security_invoker → respectent la RLS de l'appelant)
-- =============================================================================
create or replace view public.v_profile_overview
with (security_invoker = on) as
  select
    p.id,
    p.username,
    p.level,
    p.xp,
    coalesce(sum(g.co2_saved_kg) filter (where g.status = 'verified'), 0) as co2_saved_kg,
    count(g.id)               filter (where g.status = 'verified')        as gestures_count
  from public.profiles p
  left join public.eco_gestures g on g.user_id = p.id
  group by p.id;

create or replace view public.v_merchant_overview
with (security_invoker = on) as
  select
    m.id as merchant_id,
    m.name,
    count(s.id)                                            as scans_count,
    count(distinct s.customer_name)                        as customers_count,
    coalesce(sum(s.co2_saved_kg), 0)                       as co2_saved_kg,
    coalesce(avg((s.used_promo_code)::int) * 100, 0)       as promo_usage_percent
  from public.merchants m
  left join public.scans s on s.merchant_id = m.id
  group by m.id;

-- =============================================================================
--  7. DONNÉES DE DÉPART — catalogue (magasins éthiques + offres)
-- =============================================================================

-- Paliers de niveau
insert into public.levels (level, xp_required, title) values
  (1, 0,    'Pousse'),
  (2, 100,  'Jeune pousse'),
  (3, 250,  'Plant'),
  (4, 500,  'Arbuste'),
  (5, 900,  'Jeune arbre'),
  (6, 1400, 'Arbre'),
  (7, 2000, 'Chêne'),
  (8, 2700, 'Forêt'),
  (9, 3500, 'Bosquet'),
  (10,4500, 'Gardien des bois')
on conflict (level) do nothing;

-- Marchands éthiques
insert into public.merchants (slug, name, category, promo_code) values
  ('biocoop',      'Biocoop',       'Épicerie bio',   'GRAINE30'),
  ('naturalia',    'Naturalia',     'Épicerie bio',   'GRAINE20'),
  ('kusmi-tea',    'Kusmi Tea',     'Thés & infusions','GRAINE20'),
  ('la-vie-claire','La Vie Claire', 'Épicerie bio',   'GRAINE15')
on conflict (slug) do nothing;

-- Points de vente
insert into public.stores (merchant_id, name, latitude, longitude)
select m.id, v.name, v.lat, v.lng
from (values
  ('biocoop',      'Notting Hill', 51.515, -0.203),
  ('naturalia',    'Ealing',       51.513, -0.301),
  ('biocoop',      'Hammersmith',  51.492, -0.223),
  ('kusmi-tea',    'Kensington',   51.498, -0.190),
  ('la-vie-claire','Camden',       51.539, -0.143)
) as v(slug, name, lat, lng)
join public.merchants m on m.slug = v.slug
where not exists (
  select 1 from public.stores s where s.merchant_id = m.id and s.name = v.name
);

-- Offres / réductions
insert into public.offers (merchant_id, title, discount_percent, promo_code, accent_color)
select m.id, v.title, v.discount, v.promo, v.color
from (values
  ('biocoop',      'Réduction Biocoop',   30, 'GRAINE30', '#A6BFC0'),
  ('naturalia',    'Réduction Naturalia', 20, 'GRAINE20', '#D5A6A6'),
  ('kusmi-tea',    'Réduction Kusmi Tea', 20, 'GRAINE20', '#A6C394'),
  ('la-vie-claire','Réduction La Vie Claire', 15, 'GRAINE15', '#C6B79D')
) as v(slug, title, discount, promo, color)
join public.merchants m on m.slug = v.slug
where not exists (
  select 1 from public.offers o where o.merchant_id = m.id and o.title = v.title
);

-- =============================================================================
--  8. COMPTE ADMIN DE DÉMO  (admin@graine.app / mot de passe : admin)
-- -----------------------------------------------------------------------------
--  Crée un utilisateur auth complet (perso + pro) avec des données de démo.
--  NB : si ta version de GoTrue rejette cet insert, crée plutôt l'utilisateur
--  via Dashboard > Authentication > Add user, puis relance la section 8b.
-- =============================================================================
do $$
declare
  v_admin    uuid;
  v_merchant uuid;
  i          integer;
begin
  -- 8a. Utilisateur auth (déclenche handle_new_user → profil + marchand pro)
  select id into v_admin from auth.users where email = 'admin@graine.app';
  if v_admin is null then
    v_admin := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated',
      'admin@graine.app', extensions.crypt('admin', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'username', 'nol',
        'full_name', 'Nolwenn (démo)',
        'account_type', 'pro',
        'business_name', 'Maison Graine',
        'business_category', 'Épicerie bio',
        'promo_code', 'GRAINE10',
        'is_admin', true
      ),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_admin,
      jsonb_build_object('sub', v_admin::text, 'email', 'admin@graine.app'),
      'email', 'admin@graine.app', now(), now(), now()
    );
  end if;

  -- 8b. Données de démo rattachées à l'admin --------------------------------
  -- Profil : admin + niveau de démo (robuste quel que soit le mode de création)
  update public.profiles set is_admin = true, level = 6, xp = 1500 where id = v_admin;

  -- Marchand pro de l'admin (normalement créé par le trigger ; sinon on le crée)
  select mm.merchant_id into v_merchant
  from public.merchant_members mm where mm.user_id = v_admin limit 1;

  if v_merchant is null then
    insert into public.merchants (name, slug, category, promo_code)
    values ('Maison Graine', 'maison-graine-' || substr(v_admin::text, 1, 8), 'Épicerie bio', 'GRAINE10')
    returning id into v_merchant;
    insert into public.merchant_members (merchant_id, user_id, role)
    values (v_merchant, v_admin, 'owner');
  end if;

  -- Gestes écologiques (alimentent CO2 + niveau côté perso)
  if not exists (select 1 from public.eco_gestures where user_id = v_admin) then
    insert into public.eco_gestures (user_id, category, label, co2_saved_kg, distance_km, xp_earned, status, occurred_at) values
      (v_admin, 'transport', 'Vélo',  3.2, 15,  50, 'verified', now() - interval '0 day'),
      (v_admin, 'transport', 'Train', 12.5, 345, 80, 'verified', now() - interval '1 day'),
      (v_admin, 'transport', 'Bus',   4.1, 345, 40, 'verified', now() - interval '1 day'),
      (v_admin, 'energy', 'Installation de panneaux solaires', 6.0, null, 120, 'verified', now() - interval '7 day'),
      (v_admin, 'energy', 'Travaux isolation maison', 2.2, null, 90, 'pending', now() - interval '7 day');
  end if;

  -- Clients scannés (alimentent le tableau de bord pro)
  if v_merchant is not null and not exists (select 1 from public.scans where merchant_id = v_merchant) then
    -- Les 5 clients de la maquette (Orlane correspond au détail affiché)
    insert into public.scans (merchant_id, customer_name, customer_avatar, discount_percent, price_before, price_after, used_promo_code, co2_saved_kg, scanned_at) values
      (v_merchant, 'Orlane',  '#9FB3C8', 10, 20, 2,  true,  1.5, timestamptz '2025-02-13 12:05'),
      (v_merchant, 'Mathieu', '#5C8A7B', 15, 32, 27, false, 0.8, timestamptz '2025-02-12 18:42'),
      (v_merchant, 'Chris',   '#B0A8B9', 5,  14, 13, true,  0.4, timestamptz '2025-02-11 09:17'),
      (v_merchant, 'Chloé',   '#C9A27E', 20, 50, 40, true,  2.1, timestamptz '2025-02-10 16:30'),
      (v_merchant, 'Lola',    '#8FA876', 10, 18, 16, false, 0.6, timestamptz '2025-02-09 11:58');

    -- Volume supplémentaire pour le graphique « scans par jour »
    for i in 1..40 loop
      insert into public.scans (merchant_id, customer_name, discount_percent, price_before, price_after, used_promo_code, co2_saved_kg, scanned_at)
      values (
        v_merchant,
        'Client ' || i,
        (array[5,10,15,20])[1 + floor(random()*4)],
        10 + floor(random()*40),
        5 + floor(random()*30),
        random() < 0.5,
        round((random()*2)::numeric, 1),
        now() - (floor(random()*60) || ' day')::interval
      );
    end loop;
  end if;

  -- Un bon d'achat actif pour la démo
  if not exists (select 1 from public.vouchers where user_id = v_admin) then
    insert into public.vouchers (user_id, merchant_id, offer_id, code, status, expires_at)
    select v_admin, m.id, o.id, 'GRAINE-DEMO-001', 'active', now() + interval '60 day'
    from public.merchants m
    join public.offers o on o.merchant_id = m.id
    where m.slug = 'biocoop'
    limit 1;
  end if;
end $$;

-- =============================================================================
--  FIN
-- =============================================================================
