import prisma from "../config/database.js";

// ============================================================
// CREATE KEYWORD
// ============================================================

export const createKeyword = async (categoryId, keyword, weight) => {
  // 1. Normalize input
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedWeight = weight !== undefined ? Number(weight) : 5;

  // 2. Find category and its department
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      department: true,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // 3. Category must be active
  if (!category.isActive) {
    throw new Error("Cannot create a keyword for an inactive category.");
  }

  // 4. Department must be active
  if (!category.department.isActive) {
    throw new Error(
      "Cannot create a keyword under a category with an inactive department.",
    );
  }

  // 5. Check for duplicate keyword
  const existingKeyword = await prisma.categoryKeyword.findFirst({
    where: {
      categoryId,
      keyword: {
        equals: normalizedKeyword,
        mode: "insensitive",
      },
    },
  });

  if (existingKeyword) {
    throw new Error(
      "A keyword with this value already exists in this category.",
    );
  }

  // 6. Create keyword
  try {
    const createdKeyword = await prisma.categoryKeyword.create({
      data: {
        categoryId,
        keyword: normalizedKeyword,
        weight: normalizedWeight,
      },
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
    });

    // 7. Return created keyword
    return createdKeyword;
  } catch (error) {
    // 8. Handle database-level duplicate protection
    if (error.code === "P2002") {
      throw new Error(
        "A keyword with this value already exists in this category.",
      );
    }

    throw error;
  }
};

// ============================================================
// GET KEYWORDS BY CATEGORY
// ============================================================

export const getKeywordsByCategory = async (categoryId) => {
  // 1. Verify category exists
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // 2. Get keywords
  const keywords = await prisma.categoryKeyword.findMany({
    where: {
      categoryId,
    },
    orderBy: [
      {
        weight: "desc",
      },
      {
        keyword: "asc",
      },
    ],
  });

  // 3. Return keywords
  return keywords;
};

// ============================================================
// GET KEYWORD BY ID
// ============================================================

export const getKeywordById = async (keywordId) => {
  // 1. Find keyword
  const keyword = await prisma.categoryKeyword.findUnique({
    where: {
      id: keywordId,
    },
    include: {
      category: {
        include: {
          department: true,
        },
      },
    },
  });

  // 2. Verify keyword exists
  if (!keyword) {
    throw new Error("Keyword not found.");
  }

  // 3. Return keyword
  return keyword;
};

// ============================================================
// UPDATE KEYWORD
// ============================================================

export const updateKeyword = async (keywordId, keyword, weight, isActive) => {
  // 1. Find existing keyword with category and department
  const existingKeyword = await prisma.categoryKeyword.findUnique({
    where: {
      id: keywordId,
    },
    include: {
      category: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!existingKeyword) {
    throw new Error("Keyword not found.");
  }

  // 2. Normalize keyword if provided
  const normalizedKeyword =
    keyword !== undefined ? keyword.trim().toLowerCase() : undefined;

  // 3. Prevent activation under inactive category
  if (isActive === true) {
    if (!existingKeyword.category.isActive) {
      throw new Error("Cannot activate a keyword under an inactive category.");
    }

    // 4. Prevent activation under inactive department
    if (!existingKeyword.category.department.isActive) {
      throw new Error(
        "Cannot activate a keyword under a category with an inactive department.",
      );
    }
  }

  // 5. Check duplicate keyword
  if (normalizedKeyword !== undefined) {
    const duplicateKeyword = await prisma.categoryKeyword.findFirst({
      where: {
        id: {
          not: keywordId,
        },
        categoryId: existingKeyword.categoryId,
        keyword: {
          equals: normalizedKeyword,
          mode: "insensitive",
        },
      },
    });

    if (duplicateKeyword) {
      throw new Error(
        "A keyword with this value already exists in this category.",
      );
    }
  }

  // 6. Build update data
  const updateData = {};

  if (normalizedKeyword !== undefined) {
    updateData.keyword = normalizedKeyword;
  }

  if (weight !== undefined) {
    updateData.weight = Number(weight);
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // 7. Update keyword
  try {
    const updatedKeyword = await prisma.categoryKeyword.update({
      where: {
        id: keywordId,
      },
      data: updateData,
      include: {
        category: {
          include: {
            department: true,
          },
        },
      },
    });

    // 8. Return updated keyword
    return updatedKeyword;
  } catch (error) {
    // 9. Handle database-level duplicate protection
    if (error.code === "P2002") {
      throw new Error(
        "A keyword with this value already exists in this category.",
      );
    }

    throw error;
  }
};

// ============================================================
// DEACTIVATE KEYWORD
// ============================================================

export const deactivateKeyword = async (keywordId) => {
  // 1. Find keyword
  const keyword = await prisma.categoryKeyword.findUnique({
    where: {
      id: keywordId,
    },
  });

  if (!keyword) {
    throw new Error("Keyword not found.");
  }

  // 2. Soft delete by deactivating
  const updatedKeyword = await prisma.categoryKeyword.update({
    where: {
      id: keywordId,
    },
    data: {
      isActive: false,
    },
  });

  // 3. Return updated keyword
  return updatedKeyword;
};
