const adminService = require("../services/admin.service");
const {
  rejectValidator,
  queueItemValidator,
} = require("../validators/admin.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Get moderation queue (all pending stories and episodes)
const getQueue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await adminService.getQueue(parseInt(page), parseInt(limit));

    return res.status(200).json(
      successResponse(result.queue, "Moderation queue retrieved successfully", {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        storyCount: result.storyCount,
        episodeCount: result.episodeCount,
      }),
    );
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Get single pending item for review
const getQueueItem = async (req, res) => {
  try {
    const { type, id } = req.params;

    const { error } = queueItemValidator.validate({ type, id });
    if (error) {
      return res
        .status(400)
        .json(
          errorResponse(
            error.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? error : undefined,
          ),
        );
    }

    const content = await adminService.getQueueItem(type, id);

    return res
      .status(200)
      .json(successResponse(content, "Queue item retrieved successfully"));
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Approve story or episode
const approveContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    const adminId = req.user.id;

    const { error } = queueItemValidator.validate({ type, id });
    if (error) {
      return res
        .status(400)
        .json(
          errorResponse(
            error.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? error : undefined,
          ),
        );
    }

    const content = await adminService.approveContent(type, id, adminId);

    return res
      .status(200)
      .json(
        successResponse(
          content,
          `${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully`,
        ),
      );
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Reject story or episode with reason
const rejectContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    const adminId = req.user.id;

    const { error: typeError } = queueItemValidator.validate({ type, id });
    if (typeError) {
      return res
        .status(400)
        .json(
          errorResponse(
            typeError.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? typeError : undefined,
          ),
        );
    }

    const { error: bodyError, value } = rejectValidator.validate(req.body);
    if (bodyError) {
      return res
        .status(400)
        .json(
          errorResponse(
            bodyError.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? bodyError : undefined,
          ),
        );
    }

    const content = await adminService.rejectContent(
      type,
      id,
      adminId,
      value.rejection_reason,
    );

    return res
      .status(200)
      .json(
        successResponse(
          content,
          `${type.charAt(0).toUpperCase() + type.slice(1)} rejected successfully`,
        ),
      );
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

module.exports = {
  getQueue,
  getQueueItem,
  approveContent,
  rejectContent,
};
