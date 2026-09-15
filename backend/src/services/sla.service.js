import prisma from "../config/database.js";

// ============================================================
// SLA SERVICE
// ============================================================

// ============================================================
// CREATE SLA POLICY
// ============================================================

export const createSlaPolicy = async (
  name,
  description,
  departmentId,
  priority,
  responseTimeMinutes,
  resolutionTimeMinutes,
  warningPercentage,
  isActive,
) => {
  // 1. Clean the input values
  const cleanName = name.trim();
  const cleanDescription = description?.trim() || null;
  const cleanPriority = priority.trim().toUpperCase();

  // Convert numeric values because express-validator
  // validates them but request.body values are still strings.
  const cleanResponseTimeMinutes = Number(responseTimeMinutes);
  const cleanResolutionTimeMinutes = Number(resolutionTimeMinutes);

  const cleanWarningPercentage =
    warningPercentage !== undefined ? Number(warningPercentage) : 80;

  // ============================================================
  // 2. Verify that the department exists
  // ============================================================

  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  // ============================================================
  // 3. Verify that the department is active
  // ============================================================

  if (!department.isActive) {
    throw new Error("Cannot create an SLA for an inactive department.");
  }

  // ============================================================
  // 4. Check whether this department already has
  //    an SLA for this priority
  // ============================================================

  const existingPolicy = await prisma.slaPolicy.findUnique({
    where: {
      departmentId_priority: {
        departmentId,
        priority: cleanPriority,
      },
    },
  });

  if (existingPolicy) {
    throw new Error(
      "An SLA policy for this department and priority already exists.",
    );
  }

  // ============================================================
  // 5. Create the SLA policy
  // ============================================================

  const slaPolicy = await prisma.slaPolicy.create({
    data: {
      name: cleanName,
      description: cleanDescription,
      departmentId,
      priority: cleanPriority,
      responseTimeMinutes: cleanResponseTimeMinutes,
      resolutionTimeMinutes: cleanResolutionTimeMinutes,
      warningPercentage: cleanWarningPercentage,
      isActive: isActive !== undefined ? isActive : true,
    },

    include: {
      department: true,
    },
  });

  // ============================================================
  // 6. Return the created SLA policy
  // ============================================================

  return slaPolicy;
};

// ============================================================
// GET ALL SLA POLICIES
// ============================================================

export const getSlaPolicies = async () => {
  // 1. Get all SLA policies
  const slaPolicies = await prisma.slaPolicy.findMany({
    orderBy: [
      {
        department: {
          name: "asc",
        },
      },
      {
        priority: "asc",
      },
    ],

    include: {
      department: true,

      _count: {
        select: {
          requestSlas: true,
        },
      },
    },
  });

  // 2. Return SLA policies
  return slaPolicies;
};

// ============================================================
// GET SLA POLICY BY ID
// ============================================================

export const getSlaPolicyById = async (slaPolicyId) => {
  // 1. Find the SLA policy
  const slaPolicy = await prisma.slaPolicy.findUnique({
    where: {
      id: slaPolicyId,
    },

    include: {
      department: true,

      _count: {
        select: {
          requestSlas: true,
        },
      },
    },
  });

  // ============================================================
  // 2. Verify that the SLA policy exists
  // ============================================================

  if (!slaPolicy) {
    throw new Error("SLA policy not found.");
  }

  // ============================================================
  // 3. Return the SLA policy
  // ============================================================

  return slaPolicy;
};

// ============================================================
// UPDATE SLA POLICY
// ============================================================

export const updateSlaPolicy = async (
  slaPolicyId,
  name,
  description,
  departmentId,
  priority,
  responseTimeMinutes,
  resolutionTimeMinutes,
  warningPercentage,
  isActive,
) => {
  // ============================================================
  // 1. Verify that the SLA policy exists
  // ============================================================

  const existingPolicy = await prisma.slaPolicy.findUnique({
    where: {
      id: slaPolicyId,
    },
  });

  if (!existingPolicy) {
    throw new Error("SLA policy not found.");
  }

  // ============================================================
  // 2. Prepare the update data
  // ============================================================

  const updateData = {};

  let cleanDepartmentId = existingPolicy.departmentId;
  let cleanPriority = existingPolicy.priority;

  // ------------------------------------------------------------
  // 2.1 Prepare name
  // ------------------------------------------------------------

  if (name !== undefined) {
    updateData.name = name.trim();
  }

  // ------------------------------------------------------------
  // 2.2 Prepare description
  // ------------------------------------------------------------

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  // ------------------------------------------------------------
  // 2.3 Prepare department
  // ------------------------------------------------------------

  if (departmentId !== undefined) {
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new Error("Department not found.");
    }

    if (!department.isActive) {
      throw new Error("Cannot assign an SLA policy to an inactive department.");
    }

    cleanDepartmentId = departmentId;
    updateData.departmentId = departmentId;
  }

  // ------------------------------------------------------------
  // 2.4 Prepare priority
  // ------------------------------------------------------------

  if (priority !== undefined) {
    cleanPriority = priority.trim().toUpperCase();
    updateData.priority = cleanPriority;
  }

  // ------------------------------------------------------------
  // 2.5 Check department + priority uniqueness
  // ------------------------------------------------------------

  const departmentChanged = cleanDepartmentId !== existingPolicy.departmentId;

  const priorityChanged = cleanPriority !== existingPolicy.priority;

  if (departmentChanged || priorityChanged) {
    const duplicatePolicy = await prisma.slaPolicy.findUnique({
      where: {
        departmentId_priority: {
          departmentId: cleanDepartmentId,
          priority: cleanPriority,
        },
      },
    });

    if (duplicatePolicy && duplicatePolicy.id !== slaPolicyId) {
      throw new Error(
        "An SLA policy for this department and priority already exists.",
      );
    }
  }

  // ------------------------------------------------------------
  // 2.6 Prepare response time
  // ------------------------------------------------------------

  if (responseTimeMinutes !== undefined) {
    updateData.responseTimeMinutes = Number(responseTimeMinutes);
  }

  // ------------------------------------------------------------
  // 2.7 Prepare resolution time
  // ------------------------------------------------------------

  if (resolutionTimeMinutes !== undefined) {
    updateData.resolutionTimeMinutes = Number(resolutionTimeMinutes);
  }

  // ------------------------------------------------------------
  // 2.8 Prepare warning percentage
  // ------------------------------------------------------------

  if (warningPercentage !== undefined) {
    updateData.warningPercentage = Number(warningPercentage);
  }

  // ------------------------------------------------------------
  // 2.9 Prepare active status
  // ------------------------------------------------------------

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // ============================================================
  // 3. Update the SLA policy
  // ============================================================

  const slaPolicy = await prisma.slaPolicy.update({
    where: {
      id: slaPolicyId,
    },

    data: updateData,

    include: {
      department: true,
    },
  });

  // ============================================================
  // 4. Return the updated SLA policy
  // ============================================================

  return slaPolicy;
};

// ============================================================
// DEACTIVATE SLA POLICY
// ============================================================

export const deactivateSlaPolicy = async (slaPolicyId) => {
  // ============================================================
  // 1. Verify that the SLA policy exists
  // ============================================================

  const existingPolicy = await prisma.slaPolicy.findUnique({
    where: {
      id: slaPolicyId,
    },
  });

  if (!existingPolicy) {
    throw new Error("SLA policy not found.");
  }

  // ============================================================
  // 2. Check whether the SLA policy is already inactive
  // ============================================================

  if (!existingPolicy.isActive) {
    throw new Error("SLA policy is already inactive.");
  }

  // ============================================================
  // 3. Deactivate the policy instead of deleting it
  // ============================================================

  const slaPolicy = await prisma.slaPolicy.update({
    where: {
      id: slaPolicyId,
    },

    data: {
      isActive: false,
    },

    include: {
      department: true,
    },
  });

  // ============================================================
  // 4. Return the updated SLA policy
  // ============================================================

  return slaPolicy;
};
