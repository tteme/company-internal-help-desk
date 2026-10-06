import {
  createClientFeedbackTitle,
  getClientFeedbackTitles,
  getClientFeedbackTitleById,
  updateClientFeedbackTitle,
  deactivateClientFeedbackTitle,
} from "../services/client-feedback-title.service.js";

export const createClientFeedbackTitleController = async (req, res) => {
  try {
    const title = await createClientFeedbackTitle(req.body.name);

    return res.status(201).json({
      success: true,
      message: "Feedback title created successfully.",
      data: title,
    });
  } catch (error) {
    console.error("Create client feedback title error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to create feedback title.",
    });
  }
};

export const getClientFeedbackTitlesController = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === "true";

    const titles = await getClientFeedbackTitles({
      activeOnly,
    });

    return res.status(200).json({
      success: true,
      data: titles,
    });
  } catch (error) {
    console.error("Get client feedback titles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback titles.",
    });
  }
};

export const getClientFeedbackTitleByIdController = async (req, res) => {
  try {
    const title = await getClientFeedbackTitleById(req.params.id);

    return res.status(200).json({
      success: true,
      data: title,
    });
  } catch (error) {
    console.error("Get client feedback title error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to retrieve feedback title.",
    });
  }
};

export const updateClientFeedbackTitleController = async (req, res) => {
  try {
    const title = await updateClientFeedbackTitle(req.params.id, {
      name: req.body.name,
      isActive: req.body.isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Feedback title updated successfully.",
      data: title,
    });
  } catch (error) {
    console.error("Update client feedback title error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update feedback title.",
    });
  }
};

export const deactivateClientFeedbackTitleController = async (req, res) => {
  try {
    const title = await deactivateClientFeedbackTitle(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Feedback title deactivated successfully.",
      data: title,
    });
  } catch (error) {
    console.error("Deactivate client feedback title error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to deactivate feedback title.",
    });
  }
};

export const getActiveClientFeedbackTitlesController = async (req, res) => {
  try {
    const titles = await getClientFeedbackTitles({
      activeOnly: true,
    });

    return res.status(200).json({
      success: true,
      data: titles,
    });
  } catch (error) {
    console.error("Get active client feedback titles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback titles.",
    });
  }
};
