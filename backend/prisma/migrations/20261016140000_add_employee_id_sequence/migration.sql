CREATE TABLE "EmployeeIdSequence" (
    "id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmployeeIdSequence_pkey" PRIMARY KEY ("id")
);

INSERT INTO "EmployeeIdSequence" ("id", "value")
SELECT
    1,
    COALESCE(
        MAX(
            SUBSTRING("employeeId" FROM '^DIG-EMP-([0-9]+)$')::INTEGER
        ),
        0
    )
FROM "User"
WHERE "employeeId" ~ '^DIG-EMP-[0-9]+$';
