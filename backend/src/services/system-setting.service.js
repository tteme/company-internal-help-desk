import prisma from "../config/database.js";

export const getSystemSettings = async () => {
  return prisma.systemSetting.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });
};

export const getSystemSettingByKey = async (key) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (!setting) {
    throw new Error("System setting not found.");
  }

  return setting;
};

export const updateSystemSetting = async ({ key, value }) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (!setting) {
    throw new Error("System setting not found.");
  }

  if (!setting.isEditable) {
    throw new Error("This system setting cannot be edited.");
  }

  let normalizedValue;

  switch (setting.type) {
    case "STRING":
      if (typeof value !== "string") {
        throw new Error("Setting value must be a string.");
      }

      normalizedValue = value.trim();

      if (!normalizedValue) {
        throw new Error("Setting value cannot be empty.");
      }

      break;

    case "BOOLEAN":
      if (typeof value !== "boolean") {
        throw new Error("Setting value must be a boolean.");
      }

      normalizedValue = String(value);

      break;

    case "NUMBER":
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error("Setting value must be a number.");
      }

      normalizedValue = String(value);

      break;

    case "ENUM":
      if (typeof value !== "string" || !value.trim()) {
        throw new Error("Setting value must be a valid option.");
      }

      normalizedValue = value.trim();

      break;

    default:
      throw new Error("Unsupported system setting type.");
  }

  return prisma.systemSetting.update({
    where: { key },
    data: {
      value: normalizedValue,
    },
  });
};
