const express = require("express");
const dashSchema = require("../modules/dash.Schema");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const data = await dashSchema.find(); // returns all documents

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch list",
      error: error.message,
    });
  }
});

router.post("/list", async (req, res) => {
  try {
    const data = req.body;

    // Always update the only one document (if exists), else create a new one
    const updatedContent = await dashSchema.findOneAndUpdate(
      {}, // Match any document
      data, // New data to insert/update
      {
        new: true,       // Return the updated document
        upsert: true,    // Create if not exists
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      success: true,
      message: "Home content created or updated",
      data: updatedContent,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

router.post("/find", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service _id is required",
      });
    }

    // Find the document that contains the service in the array
    const document = await dashSchema.findOne({
      "Most_booked_services._id": id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Service not found in Most_booked_services",
      });
    }

    // Extract the exact service from the array
    const service = document.Most_booked_services.find(service => service._id.toString() === id);

    res.status(200).json({
      success: true,
      message: "Service found",
      data: service,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


module.exports = router;