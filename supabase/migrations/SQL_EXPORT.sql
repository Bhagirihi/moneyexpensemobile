
CREATE OR REPLACE FUNCTION export_full_schema()
RETURNS text AS $$
DECLARE
  result text := '';
BEGIN
  -- 1. Export Table Definitions (basic version)
  SELECT string_agg(format(
    'CREATE TABLE IF NOT EXISTS %I (%s);',
    table_name,
    (
      SELECT string_agg(format('%I %s%s',
        column_name,
        data_type,
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
      ), ', ')
      FROM information_schema.columns
      WHERE table_name = t.table_name
        AND table_schema = 'public'
    )
  ), E'\n\n')
  INTO result
  FROM information_schema.tables t
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

  -- 2. Append Foreign Key Constraints
  result := result || E'\n\n-- Foreign Keys\n';

  SELECT result || E'\n' || string_agg(format(
    'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I (%I);',
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name,
    ccu.column_name
  ), E'\n')
  INTO result
  FROM
    information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

  -- 3. Append Triggers (public + auth)
  result := result || E'\n\n-- Triggers (public, auth)\n';

  SELECT result || E'\n' || string_agg(format(
    '-- Trigger: %I on %I\nCREATE TRIGGER %I %s %s ON %I FOR EACH ROW %s;',
    trigger_name,
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation, -- FIXED HERE
    event_object_table,
    action_statement
  ), E'\n\n')
  INTO result
  FROM information_schema.triggers
  WHERE trigger_schema IN ('public', 'auth');

  RETURN result;
END;
$$ LANGUAGE plpgsql;


SELECT
  'CREATE OR REPLACE FUNCTION ' || n.nspname || '.' || p.proname || '(' ||
  pg_get_function_arguments(p.oid) || ') RETURNS ' ||
  pg_get_function_result(p.oid) || ' AS $$' ||
  pg_get_functiondef(p.oid) || '$$ LANGUAGE ' || l.lanname || ';'
AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname IN ('public', 'auth')
  AND p.prokind = 'f';  -- 'f' = function (not agg, proc, etc.)

SELECT export_full_schema();
