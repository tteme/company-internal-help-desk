
-- Add the cross-department escalation permission if missing.
INSERT INTO "Permission" ("id", "name", "description", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'request.escalate_department',
  'Escalate a request to another department.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO NOTHING;

-- Grant the permission to department heads if missing.
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT
  gen_random_uuid()::text,
  r."id",
  p."id",
  CURRENT_TIMESTAMP
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r."name" = 'DEPARTMENT_HEAD'
  AND p."name" = 'request.escalate_department'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
