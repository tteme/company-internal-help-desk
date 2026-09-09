import prisma from "../config/database.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createCategory = async (name, code, description, departmentId) => {
  // 1. Normalize input
  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();
  const normalizedDescription = description?.trim() || null;

  // 2. Verify that the department exists
  const department = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
  });

  if (!department) {
    throw new Error("Department not found.");
  }

  // 3. Verify that the department is active
  if (!department.isActive) {
    throw new Error("Cannot create a category under an inactive department.");
  }

  // 4. Check for duplicate category name within the department
  const existingCategory = await prisma.category.findFirst({
    where: {
      departmentId,
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new Error(
      "A category with this name already exists in this department.",
    );
  }

  // 5. Check for duplicate category code
  const existingCode = await prisma.category.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (existingCode) {
    throw new Error("A category with this code already exists.");
  }

  // 6. Create the category
  try {
    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        code: normalizedCode,
        description: normalizedDescription,
        departmentId,
      },
      include: {
        department: true,
      },
    });

    // 7. Return the created category
    return category;
  } catch (error) {
    // Handle database unique constraint errors
    if (error.code === "P2002") {
      const target = error.meta?.target;

      if (Array.isArray(target) && target.includes("code")) {
        throw new Error("A category with this code already exists.");
      }

      if (
        Array.isArray(target) &&
        target.includes("departmentId") &&
        target.includes("name")
      ) {
        throw new Error(
          "A category with this name already exists in this department.",
        );
      }
    }

    // Re-throw unexpected errors
    throw error;
  }
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getCategories = async () => {
  // 1. Get all categories
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      department: true,
      _count: {
        select: {
          requests: true,
          articles: true,
          keywords: true,
        },
      },
    },
  });

  // 2. Return categories
  return categories;
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getCategoryById = async (categoryId) => {
  // 1. Find the category
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      department: true,
      _count: {
        select: {
          requests: true,
          articles: true,
          keywords: true,
        },
      },
    },
  });

  // 2. Verify that the category exists
  if (!category) {
    throw new Error("Category not found.");
  }

  // 3. Return the category
  return category;
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategory = async (
  categoryId,
  name,
  code,
  description,
  departmentId,
  isActive,
) => {
  // 1. Find the existing category
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  // 2. Verify that the category exists
  if (!existingCategory) {
    throw new Error("Category not found.");
  }

  // 3. Normalize input
  const normalizedName = name !== undefined ? name.trim() : undefined;

  const normalizedCode =
    code !== undefined ? code.trim().toUpperCase() : undefined;

  const normalizedDescription =
    description !== undefined ? description?.trim() || null : undefined;

  // 4. Determine and verify the target department
  let targetDepartmentId = existingCategory.departmentId;
  let targetDepartment;

  if (departmentId !== undefined) {
    targetDepartment = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!targetDepartment) {
      throw new Error("Department not found.");
    }

    if (!targetDepartment.isActive) {
      throw new Error("Cannot assign a category to an inactive department.");
    }

    targetDepartmentId = departmentId;
  } else {
    targetDepartment = await prisma.department.findUnique({
      where: {
        id: existingCategory.departmentId,
      },
    });

    if (!targetDepartment) {
      throw new Error("Category department not found.");
    }
  }

  // 5. Prevent activating a category under an inactive department
  if (isActive === true && !targetDepartment.isActive) {
    throw new Error("Cannot activate a category under an inactive department.");
  }

  // 6. Check duplicate category name
  if (normalizedName !== undefined || departmentId !== undefined) {
    const duplicateName = await prisma.category.findFirst({
      where: {
        id: {
          not: categoryId,
        },
        departmentId: targetDepartmentId,
        name: {
          equals: normalizedName ?? existingCategory.name,
          mode: "insensitive",
        },
      },
    });

    if (duplicateName) {
      throw new Error(
        "A category with this name already exists in this department.",
      );
    }
  }

  // 7. Check duplicate category code
  if (normalizedCode !== undefined) {
    const duplicateCode = await prisma.category.findUnique({
      where: {
        code: normalizedCode,
      },
    });

    if (duplicateCode && duplicateCode.id !== categoryId) {
      throw new Error("A category with this code already exists.");
    }
  }

  // 8. Build update data
  const updateData = {};

  if (normalizedName !== undefined) {
    updateData.name = normalizedName;
  }

  if (normalizedCode !== undefined) {
    updateData.code = normalizedCode;
  }

  if (normalizedDescription !== undefined) {
    updateData.description = normalizedDescription;
  }

  if (departmentId !== undefined) {
    updateData.departmentId = departmentId;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // 9. Update the category
  try {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: updateData,
      include: {
        department: true,
      },
    });

    // 10. Return the updated category
    return category;
  } catch (error) {
    // Handle database unique constraint errors
    if (error.code === "P2002") {
      const target = error.meta?.target;

      if (Array.isArray(target) && target.includes("code")) {
        throw new Error("A category with this code already exists.");
      }

      if (
        Array.isArray(target) &&
        target.includes("departmentId") &&
        target.includes("name")
      ) {
        throw new Error(
          "A category with this name already exists in this department.",
        );
      }
    }

    // Re-throw unexpected errors
    throw error;
  }
};

// ============================================================
// DEACTIVATE CATEGORY
// ============================================================

export const deactivateCategory = async (categoryId) => {
  // 1. Find the category
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  // 2. Verify that the category exists
  if (!category) {
    throw new Error("Category not found.");
  }

  // 3. Deactivate the category
  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      isActive: false,
    },
  });

  // 4. Return the deactivated category
  return updatedCategory;
};
