import {
  createClientFeedback,
  getClientFeedbacks,
  getClientFeedbackById,
  assignClientFeedback,
  addClientFeedbackUpdate,
  updateClientFeedbackStatus,
} from "../services/clientFeedback.service.js";

// ============================================================
// CREATE CLIENT FEEDBACK
// ============================================================

export const createClientFeedbackController = async (req, res) => {
  try {
    const feedback = await createClientFeedback({
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      description: req.body.description,
    });

    return res.status(201).json({
      success: true,
      message: "Your feedback has been submitted successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error("Create client feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
    });
  }
};

// ============================================================
// GET CLIENT FEEDBACKS
// ============================================================

export const getClientFeedbacksController = async (req, res) => {
  try {
    const feedbacks = await getClientFeedbacks({
      userId: req.user.id,
      role: req.user.role,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Get client feedbacks error:", error);

    if (error.message === "You are not authorized to view client feedback.") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve client feedback.",
    });
  }
};

// ============================================================
// GET CLIENT FEEDBACK BY ID
// ============================================================

export const getClientFeedbackByIdController = async (req, res) => {
  try {
    const feedback = await getClientFeedbackById({
      feedbackId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Get client feedback by ID error:", error);

    if (error.message === "Client feedback not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "You are not authorized to view this client feedback."
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve client feedback.",
    });
  }
};

// ============================================================
// ASSIGN CLIENT FEEDBACK
// ============================================================

export const assignClientFeedbackController = async (req, res) => {
  try {
    const feedback = await assignClientFeedback({
      feedbackId: req.params.id,
      departmentId: req.body.departmentId,
      assignedToId: req.body.assignedToId,
      assignedById: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Client feedback assigned successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error("Assign client feedback error:", error);

    if (error.message === "Client feedback not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "Only feedback pending review can be assigned." ||
      error.message === "Department not found or inactive." ||
      error.message ===
        "The selected user is not an active department officer or department head in the selected department."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to assign client feedback.",
    });
  }
};
// ============================================================
// UPDATE STATUS
// ============================================================
export const updateClientFeedbackStatusController = async (req, res) => {
  try {
    const feedback = await updateClientFeedbackStatus({
      feedbackId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      message: "Client feedback status updated successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error("Update client feedback status error:", error);

    if (error.message === "Client feedback not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "You are not authorized to update this client feedback."
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "Only administrators can dismiss client feedback."
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.startsWith(
        "Client feedback cannot be changed from",
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update client feedback status.",
    });
  }
};
// ============================================================
// ADD INTERNAL UPDATE
// ============================================================
export const addClientFeedbackUpdateController = async (req, res) => {
  try {
    const update = await addClientFeedbackUpdate({
      feedbackId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
      message: req.body.message,
    });

    return res.status(201).json({
      success: true,
      message: "Client feedback update added successfully.",
      data: update,
    });
  } catch (error) {
    console.error("Add client feedback update error:", error);

    if (error.message === "Client feedback not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "You are not authorized to add an update to this client feedback." ||
      error.message ===
        "Dismissed client feedback cannot receive updates."
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add client feedback update.",
    });
  }
};