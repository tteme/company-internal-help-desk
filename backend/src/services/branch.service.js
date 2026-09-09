import prisma from "../config/database.js";

// ============================================================
// BRANCH SERVICE
// ============================================================

// ============================================================
// CREATE BRANCH
// ============================================================

export const createBranch = async (name, code, address, phone, email) => {
  // 1. Clean the input values
  const cleanName = name.trim();
  const cleanCode = code.trim().toUpperCase();
  const cleanAddress = address?.trim() || null;
  const cleanPhone = phone?.trim() || null;
  const cleanEmail = email?.trim().toLowerCase() || null;

  // 2. Check whether a branch with the same name already exists
  const existingName = await prisma.branch.findFirst({
    where: {
      name: {
        equals: cleanName,
        mode: "insensitive",
      },
    },
  });

  if (existingName) {
    throw new Error("A branch with this name already exists.");
  }

  // 3. Check whether a branch with the same code already exists
  const existingCode = await prisma.branch.findUnique({
    where: {
      code: cleanCode,
    },
  });

  if (existingCode) {
    throw new Error("A branch with this code already exists.");
  }

  // 4. Create the branch
  const branch = await prisma.branch.create({
    data: {
      name: cleanName,
      code: cleanCode,
      address: cleanAddress,
      phone: cleanPhone,
      email: cleanEmail,
    },
  });

  // 5. Return the created branch
  return branch;
};

// ============================================================
// GET ALL BRANCHES
// ============================================================

export const getBranches = async () => {
  // 1. Get all branches
  const branches = await prisma.branch.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  // 2. Return branches
  return branches;
};

// ============================================================
// GET BRANCH BY ID
// ============================================================

export const getBranchById = async (branchId) => {
  // 1. Find the branch
  const branch = await prisma.branch.findUnique({
    where: {
      id: branchId,
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  // 2. Verify that the branch exists
  if (!branch) {
    throw new Error("Branch not found.");
  }

  // 3. Return the branch
  return branch;
};

// ============================================================
// UPDATE BRANCH
// ============================================================

export const updateBranch = async (
  branchId,
  name,
  code,
  address,
  phone,
  email,
  isActive,
) => {
  // 1. Verify that the branch exists
  const existingBranch = await prisma.branch.findUnique({
    where: {
      id: branchId,
    },
  });

  if (!existingBranch) {
    throw new Error("Branch not found.");
  }

  // 2. Prepare the update data
  const updateData = {};

  // 3. Update branch name if provided
  if (name !== undefined) {
    const cleanName = name.trim();

    const duplicateName = await prisma.branch.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: "insensitive",
        },
        NOT: {
          id: branchId,
        },
      },
    });

    if (duplicateName) {
      throw new Error("A branch with this name already exists.");
    }

    updateData.name = cleanName;
  }

  // 4. Update branch code if provided
  if (code !== undefined) {
    const cleanCode = code.trim().toUpperCase();

    const duplicateCode = await prisma.branch.findFirst({
      where: {
        code: cleanCode,
        NOT: {
          id: branchId,
        },
      },
    });

    if (duplicateCode) {
      throw new Error("A branch with this code already exists.");
    }

    updateData.code = cleanCode;
  }

  // 5. Update address if provided
  if (address !== undefined) {
    updateData.address = address?.trim() || null;
  }

  // 6. Update phone if provided
  if (phone !== undefined) {
    updateData.phone = phone?.trim() || null;
  }

  // 7. Update email if provided
  if (email !== undefined) {
    updateData.email = email?.trim().toLowerCase() || null;
  }

  // 8. Update active status if provided
  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // 9. Update the branch
  const branch = await prisma.branch.update({
    where: {
      id: branchId,
    },
    data: updateData,
  });

  // 10. Return the updated branch
  return branch;
};

// ============================================================
// DEACTIVATE BRANCH
// ============================================================

export const deactivateBranch = async (branchId) => {
  // 1. Verify that the branch exists
  const branch = await prisma.branch.findUnique({
    where: {
      id: branchId,
    },
  });

  if (!branch) {
    throw new Error("Branch not found.");
  }

  // 2. Check whether the branch is already inactive
  if (!branch.isActive) {
    throw new Error("Branch is already inactive.");
  }

  // 3. Deactivate the branch instead of deleting it
  const updatedBranch = await prisma.branch.update({
    where: {
      id: branchId,
    },
    data: {
      isActive: false,
    },
  });

  // 4. Return the updated branch
  return updatedBranch;
};
