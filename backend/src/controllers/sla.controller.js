import {
  createSlaPolicy,
  getSlaPolicies,
  getSlaPolicyById,
  updateSlaPolicy,
  deactivateSlaPolicy,
} from "../services/sla.service.js";

// ============================================================
// CREATE SLA POLICY
// ============================================================

export const createSlaPolicyController = async (req, res) => {
  try {
    // 1. Get SLA policy data from the request
    const {
      name,
      description,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      warningPercentage,
      isActive,
    } = req.body;

    // 2. Create the SLA policy
    const slaPolicy = await createSlaPolicy(
      name,
      description,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      warningPercentage,
      isActive,
    );

    // 3. Return the created SLA policy
    return res.status(201).json({
      success: true,
      message: "SLA policy created successfully.",
      data: slaPolicy,
    });
  } catch (error) {
    console.error("Create SLA policy error:", error);

    // 4. Handle known business errors
    if (
      error.message === "Department not found." ||
      error.message === "Cannot create an SLA for an inactive department." ||
      error.message ===
        "An SLA policy for this department and priority already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to create SLA policy.",
    });
  }
};

// ============================================================
// GET ALL SLA POLICIES
// ============================================================

export const getSlaPoliciesController = async (req, res) => {
  try {
    // 1. Get all SLA policies
    const slaPolicies = await getSlaPolicies();

    // 2. Return SLA policies
    return res.status(200).json({
      success: true,
      message: "SLA policies retrieved successfully.",
      data: slaPolicies,
    });
  } catch (error) {
    console.error("Get SLA policies error:", error);

    // 3. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve SLA policies.",
    });
  }
};

// ============================================================
// GET SLA POLICY BY ID
// ============================================================

export const getSlaPolicyByIdController = async (req, res) => {
  try {
    // 1. Get SLA policy ID
    const { id } = req.params;

    // 2. Get the SLA policy
    const slaPolicy = await getSlaPolicyById(id);

    // 3. Return the SLA policy
    return res.status(200).json({
      success: true,
      message: "SLA policy retrieved successfully.",
      data: slaPolicy,
    });
  } catch (error) {
    console.error("Get SLA policy error:", error);

    // 4. Handle SLA policy not found
    if (error.message === "SLA policy not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve SLA policy.",
    });
  }
};

// ============================================================
// UPDATE SLA POLICY
// ============================================================

export const updateSlaPolicyController = async (req, res) => {
  try {
    // 1. Get SLA policy ID
    const { id } = req.params;

    // 2. Get update data
    const {
      name,
      description,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      warningPercentage,
      isActive,
    } = req.body;

    // 3. Update the SLA policy
    const slaPolicy = await updateSlaPolicy(
      id,
      name,
      description,
      departmentId,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      warningPercentage,
      isActive,
    );

    // 4. Return the updated SLA policy
    return res.status(200).json({
      success: true,
      message: "SLA policy updated successfully.",
      data: slaPolicy,
    });
  } catch (error) {
    console.error("Update SLA policy error:", error);

    // 5. Handle known business errors
    if (
      error.message === "SLA policy not found." ||
      error.message === "Department not found." ||
      error.message ===
        "Cannot assign an SLA policy to an inactive department." ||
      error.message ===
        "An SLA policy for this department and priority already exists."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 6. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to update SLA policy.",
    });
  }
};

// ============================================================
// DEACTIVATE SLA POLICY
// ============================================================

export const deactivateSlaPolicyController = async (req, res) => {
  try {
    // 1. Get SLA policy ID
    const { id } = req.params;

    // 2. Deactivate the SLA policy
    const slaPolicy = await deactivateSlaPolicy(id);

    // 3. Return the updated SLA policy
    return res.status(200).json({
      success: true,
      message: "SLA policy deactivated successfully.",
      data: slaPolicy,
    });
  } catch (error) {
    console.error("Deactivate SLA policy error:", error);

    // 4. Handle known business errors
    if (
      error.message === "SLA policy not found." ||
      error.message === "SLA policy is already inactive."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // 5. Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate SLA policy.",
    });
  }
};
