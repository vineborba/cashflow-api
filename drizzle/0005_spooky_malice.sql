-- Insert default tags for all existing users
INSERT INTO `tags` (`id`, `name`, `user_id`, `created_at`, `updated_at`)
SELECT
  LOWER(
    HEX(RANDOMBLOB(4)) || '-' ||
    HEX(RANDOMBLOB(2)) || '-' ||
    '4' || SUBSTR(HEX(RANDOMBLOB(2)), 2) || '-' ||
    SUBSTR('89ab', ABS(RANDOM()) % 4 + 1, 1) || SUBSTR(HEX(RANDOMBLOB(2)), 2) || '-' ||
    HEX(RANDOMBLOB(6))
  ) as id,
  tag_name,
  u.id as user_id,
  CAST(strftime('%s', 'now') AS INTEGER) * 1000 as created_at,
  NULL as updated_at
FROM users u
CROSS JOIN (
  SELECT 'Alimentação' as tag_name
  UNION ALL SELECT 'Carro'
  UNION ALL SELECT 'Educação'
  UNION ALL SELECT 'Salário'
  UNION ALL SELECT 'Transporte'
  UNION ALL SELECT 'Saúde'
  UNION ALL SELECT 'Moradia'
  UNION ALL SELECT 'Lazer'
  UNION ALL SELECT 'Serviços'
  UNION ALL SELECT 'Outros'
  UNION ALL SELECT 'Streaming'
) default_tags
WHERE u.deleted_at IS NULL;