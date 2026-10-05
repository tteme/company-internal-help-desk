import prisma from "../config/database.js";

export const getSystemStatus = async () => {
  const setting = await prisma.systemSetting.findUnique({
    where: {
      key: "system.maintenanceMode",
    },
    select: {
      value: true,
    },
  });

  return {
    maintenanceMode: setting?.value === "true",
  };
};
