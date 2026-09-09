import {
  createRequest,
  getOfficerRequests,
  getRequestById,
  startRequest,
  addRequestComment,
  resolveRequest,
  confirmOrRejectRequest,
  escalateRequest,
  getMyRequests,
  rateRequest,
} from "../services/request.service.js";

export const createRequestController = async (req, res) => {
  try {
    const { title, description } = req.body;

    const request = await createRequest({
      creatorId: req.user.id,
      title,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Request created and assigned successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Create request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOfficerRequestsController = async (req, res) => {
  try {
    const requests = await getOfficerRequests(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Assigned requests retrieved successfully.",
      data: requests,
    });
  } catch (error) {
    console.error("Get officer requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assigned requests.",
    });
  }
};

export const getRequestByIdController = async (req, res) => {
  try {
    const request = await getRequestById({
      requestId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Request retrieved successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Get request by ID error:", error);

    const statusCode = error.message === "Request not found." ? 404 : 403;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const startRequestController = async (req, res) => {
  try {
    const request = await startRequest({
      requestId: req.params.id,
      officerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Request moved to in-progress successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Start request error:", error);

    let statusCode = 400;

    if (error.message === "Request not found.") {
      statusCode = 404;
    }

    if (error.message === "You are not authorized to update this request.") {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const addRequestCommentController = async (req, res) => {
  try {
    const result = await addRequestComment({
      requestId: req.params.id,
      userId: req.user.id,
      content: req.body.content,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Add request comment error:", error);

    let statusCode = 400;

    if (error.message === "Request not found.") {
      statusCode = 404;
    }

    if (
      error.message === "You are not authorized to comment on this request."
    ) {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const resolveRequestController = async (req, res) => {
  try {
    const request = await resolveRequest({
      requestId: req.params.id,
      officerId: req.user.id,
      message: req.body.message,
    });

    return res.status(200).json({
      success: true,
      message: "Request resolved successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Resolve request error:", error);

    let statusCode = 400;

    if (error.message === "Request not found.") {
      statusCode = 404;
    }

    if (error.message === "You are not authorized to resolve this request.") {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const confirmOrRejectRequestController = async (req, res) => {
  try {
    const { decision, message } = req.body;

    const request = await confirmOrRejectRequest({
      requestId: req.params.id,
      employeeId: req.user.id,
      decision,
      message,
    });

    return res.status(200).json({
      success: true,
      message:
        decision === "CONFIRM"
          ? "Request confirmed and closed successfully."
          : "Request rejected and reopened successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Confirm or reject request error:", error);

    if (error.message === "Request not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("Only the employee") ||
      error.message.includes("not authorized")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const escalateRequestController = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { reason, description } = req.body;

    const result = await escalateRequest({
      requestId,
      officerId: req.user.id,
      reason,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Request escalated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Escalate request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all requests created by the authenticated employee.
 */
export const getMyRequestsController = async (req, res) => {
  try {
    // ---------------------------------------------------------
    // 1. Get authenticated user's ID
    // ---------------------------------------------------------

    const userId = req.user.id;

    // ---------------------------------------------------------
    // 2. Get requests created by this employee
    // ---------------------------------------------------------

    const requests = await getMyRequests(userId);

    // ---------------------------------------------------------
    // 3. Return requests
    // ---------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Your requests retrieved successfully.",
      data: requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your requests.",
    });
  }
};

// ============================================================
// RATE REQUEST
// ============================================================

export const rateRequestController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: requestId } = req.params;

    const requestRating = await rateRequest(
      requestId,
      req.user.id,
      rating,
      comment,
    );

    return res.status(201).json({
      success: true,
      message: "Request rated successfully.",
      data: requestRating,
    });
  } catch (error) {
    console.error("Rate request error:", error);

    if (
      error.message === "Request not found." ||
      error.message === "You can only rate your own requests." ||
      error.message === "You can only rate a closed request." ||
      error.message === "This request has already been rated."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to rate request.",
    });
  }
};