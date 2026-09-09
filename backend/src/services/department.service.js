import prisma from "../config/database.js";

// ============================================================
// DEPARTMENT SERVICE
// ============================================================

// ============================================================
// CREATE DEPARTMENT
// ============================================================

export const createDepartment = async (name, code, description) => {
  // 1. Clean the input values
  const cleanName = name.trim();
  const cleanCode = code.trim().toUpperCase();
  const cleanDescription = description?.trim() || null;

  // 2. Check whether a department with the same name already exists
  const existingName = await prisma.department.findFirst({
    where: {
      name: {
        equals: cleanName,
        mode: "insensitive",
      },
    },
  });

  if (existingName) {
    throw new Error("A department with this name already exists.");
  }

  // 3. Check whether a department with the same code already exists
  const existingCode = await prisma.department.findUnique({
    where: {
      code: cleanCode,
    },
  });

  if (existingCode) {
    throw new Error("A department with this code already exists.");
  }

  // 4. Create the department
  const department = await prisma.department.create({
    data: {
      name: cleanName,
      code: cleanCode,
      description: cleanDescription,
    },
  });

  // 5. Return the created department
  return department;
};

// ============================================================
// GET ALL DEPARTMENTS
// ============================================================

export const getDepartments = async () => {
  // 1. Get all departments
  const departments = await prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          users: true,
          categories: true,
          requests: true,
        },
      },
    },
  });

  // 2. Return departments
  return departments;
};

// ============================================================
// GET DEPARTMENT BY ID
// ============================================================

export const getDepartmentById = async (departmentId) => {
  // 1. Find the department
  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    include: {
      _count: {
        select: {
          users: true,
          categories: true,
          requests: true,
        },
      },
    },
  });

  // 2. Verify that the department exists
  if (!department) {
    throw new Error("Department not found.");
  }

  // 3. Return the department
  return department;
};

// ============================================================
// UPDATE DEPARTMENT
// ============================================================

export const updateDepartment = async (
  departmentId,
  name,
  code,
  description,
  isActive,
) => {
  // 1. Verify that the department exists
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!existingDepartment) {
    throw new Error("Department not found.");
  }

  // 2. Prepare the update data
  const updateData = {};

  if (name !== undefined) {
    const cleanName = name.trim();

    const duplicateName = await prisma.department.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: "insensitive",
        },
        NOT: {
          id: departmentId,
        },
      },
    });

    if (duplicateName) {
      throw new Error("A department with this name already exists.");
    }

    updateData.name = cleanName;
  }

  if (code !== undefined) {
    const cleanCode = code.trim().toUpperCase();

    const duplicateCode = await prisma.department.findFirst({
      where: {
        code: cleanCode,
        NOT: {
          id: departmentId,
        },
      },
    });

    if (duplicateCode) {
      throw new Error("A department with this code already exists.");
    }

    updateData.code = cleanCode;
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // 3. Update the department
  const department = await prisma.department.update({
    where: {
      id: departmentId,
    },
    data: updateData,
  });

  // 4. Return the updated department
  return department;
};

// ============================================================
// DEACTIVATE DEPARTMENT
// ============================================================

export const deactivateDepartment = async (departmentId) => {
  // 1. Verify that the department exists
  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  // 2. Check whether the department is already inactive
  if (!department.isActive) {
    throw new Error("Department is already inactive.");
  }

  // 3. Deactivate the department instead of deleting it
  const updatedDepartment = await prisma.department.update({
    where: {
      id: departmentId,
    },
    data: {
      isActive: false,
    },
  });

  // 4. Return the updated department
  return updatedDepartment;
};
