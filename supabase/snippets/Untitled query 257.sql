insert into public.profiles (id, type, name) 
values ('00000000-0000-0000-0000-000000000099', 'agent', 'TEST-LIVE');

insert into public.agents (profile_id, name, model, creator, cert_level, trust_score)
values ('00000000-0000-0000-0000-000000000099', 'TEST-LIVE', 'test-model', 'Test Corp', 'UNVERIFIED', 100);