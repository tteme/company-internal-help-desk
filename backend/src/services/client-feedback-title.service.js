import prisma from "../config/database.js";

export const createClientFeedbackTitle = async (name) => {
  const normalizedName = name.trim();

  const existingTitle = await prisma.clientFeedbackTitle.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
  });

  if (existingTitle) {
    const error = new Error("A feedback title with this name already exists.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await prisma.clientFeedbackTitle.create({
      data: {
        name: normalizedName,
        isActive: true,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "A feedback title with this name already exists.",
      );
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
};

export const getClientFeedbackTitles = async ({ activeOnly = false } = {}) => {
  return prisma.clientFeedbackTitle.findMany({
    where: activeOnly
      ? {
          isActive: true,
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
  });
};

export const getClientFeedbackTitleById = async (id) => {
  const title = await prisma.clientFeedbackTitle.findUnique({
    where: {
      id,
    },
  });

  if (!title) {
    const error = new Error("Feedback title not found.");
    error.statusCode = 404;
    throw error;
  }

  return title;
};

export const updateClientFeedbackTitle = async (id, { name, isActive }) => {
  const existingTitle = await prisma.clientFeedbackTitle.findUnique({
    where: {
      id,
    },
  });

  if (!existingTitle) {
    const error = new Error("Feedback title not found.");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    const normalizedName = name.trim();

    const duplicateTitle = await prisma.clientFeedbackTitle.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (duplicateTitle) {
      const error = new Error(
        "A feedback title with this name already exists.",
      );
      error.statusCode = 400;
      throw error;
    }

    updateData.name = normalizedName;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  try {
    return await prisma.clientFeedbackTitle.update({
      where: {
        id,
      },
      data: updateData,
    });
  } catch (error) {
    if (error.code === "P2002") {
      const duplicateError = new Error(
        "A feedback title with this name already exists.",
      );
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
};

export const deactivateClientFeedbackTitle = async (id) => {
  const existingTitle = await prisma.clientFeedbackTitle.findUnique({
    where: {
      id,
    },
  });

  if (!existingTitle) {
    const error = new Error("Feedback title not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.clientFeedbackTitle.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};
