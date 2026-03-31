-- ============================================================
-- CryptoBroker — Required Supabase RPCs & Triggers
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─── 1. Auto-create profile on user signup ──────────────────
-- Creates a row in profiles when a new user signs up via Supabase Auth.
-- Without this, new users will have no balance row.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, balance)
  values (new.id, new.email, 10000)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 2. execute_trade_atomic ────────────────────────────────
-- Opens a new leveraged position atomically.
-- Checks margin availability, inserts position row.
-- Balance is NOT deducted on open — only on close.

create or replace function public.execute_trade_atomic(
  p_user_id uuid,
  p_symbol text,
  p_side text,
  p_amount numeric,
  p_entry_price numeric,
  p_leverage int,
  p_margin numeric,
  p_liquidation_price numeric
)
returns jsonb as $$
declare
  v_balance numeric;
  v_used_margin numeric;
  v_available numeric;
  v_position_id uuid;
begin
  -- Get current balance
  select balance into v_balance
  from public.profiles
  where id = p_user_id;

  if v_balance is null then
    return jsonb_build_object('success', false, 'message', 'Account not found');
  end if;

  -- Calculate total used margin from open positions
  select coalesce(sum(margin), 0) into v_used_margin
  from public.positions
  where user_id = p_user_id and status = 'OPEN';

  v_available := v_balance - v_used_margin;

  -- Check if user has enough available capital for the new margin
  if v_available < p_margin then
    return jsonb_build_object(
      'success', false,
      'message', format('Insufficient margin. Available: $%s, Required: $%s',
                        round(v_available, 2), round(p_margin, 2))
    );
  end if;

  -- Insert the position
  insert into public.positions (
    user_id, symbol, side, amount, entry_price,
    leverage, margin, liquidation_price, status
  ) values (
    p_user_id, p_symbol, p_side, p_amount, p_entry_price,
    p_leverage, p_margin, p_liquidation_price, 'OPEN'
  )
  returning id into v_position_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Position opened',
    'position_id', v_position_id,
    'entry_price', p_entry_price
  );
end;
$$ language plpgsql security definer;


-- ─── 3. close_position_atomic ───────────────────────────────
-- Closes a position, records exit price and P&L,
-- and creates a transaction to update the user's balance.

create or replace function public.close_position_atomic(
  p_user_id uuid,
  p_position_id uuid,
  p_exit_price numeric,
  p_pnl numeric
)
returns jsonb as $$
declare
  v_position record;
begin
  -- Lock and verify the position belongs to this user and is open
  select * into v_position
  from public.positions
  where id = p_position_id
    and user_id = p_user_id
    and status = 'OPEN'
  for update;

  if v_position is null then
    return jsonb_build_object('success', false, 'message', 'Position not found or already closed');
  end if;

  -- Update position to closed
  update public.positions
  set status = 'CLOSED',
      exit_price = p_exit_price,
      pnl = p_pnl,
      closed_at = now()
  where id = p_position_id;

  -- Insert transaction to adjust balance (trigger will update profiles.balance)
  insert into public.transactions (user_id, amount, type, reference_id)
  values (p_user_id, p_pnl, 'REALIZED_PNL', p_position_id);

  return jsonb_build_object(
    'success', true,
    'message', format('P&L: %s$%s', case when p_pnl >= 0 then '+' else '' end, round(p_pnl, 2)),
    'close_price', p_exit_price,
    'pnl', p_pnl
  );
end;
$$ language plpgsql security definer;


-- ─── 4. add_demo_funds ──────────────────────────────────────
-- Adds demo funds to a user's account with max balance guard.
-- Uses a transaction insert so the balance trigger keeps everything consistent.

create or replace function public.add_demo_funds(
  p_user_id uuid,
  p_amount numeric,
  p_max_balance numeric
)
returns jsonb as $$
declare
  v_current_balance numeric;
  v_new_balance numeric;
begin
  select balance into v_current_balance
  from public.profiles
  where id = p_user_id;

  if v_current_balance is null then
    return jsonb_build_object('success', false, 'message', 'Account not found');
  end if;

  if v_current_balance + p_amount > p_max_balance then
    return jsonb_build_object(
      'success', false,
      'message', format('Cannot exceed max balance of $%s', p_max_balance)
    );
  end if;

  -- Insert deposit transaction (trigger updates profiles.balance)
  insert into public.transactions (user_id, amount, type)
  values (p_user_id, p_amount, 'DEPOSIT');

  v_new_balance := v_current_balance + p_amount;

  return jsonb_build_object(
    'success', true,
    'message', format('$%s added to your demo account.', p_amount),
    'new_balance', v_new_balance
  );
end;
$$ language plpgsql security definer;
