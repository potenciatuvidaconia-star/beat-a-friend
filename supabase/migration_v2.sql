-- Migration v2: make api_id nullable, add group_letter
alter table public.matches alter column api_id drop not null;
alter table public.matches add column if not exists group_letter text;
