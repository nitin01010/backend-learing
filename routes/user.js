const express = require("express");
const User = require("../modules/user.Schema");
const router = express.Router();
const { Twilio } = require("twilio");
const jwt = require('jsonwebtoken');
const verifyToken = require("../middleware/authMiddleware");
const dashSchema = require("../modules/dash.Schema");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const client = new Twilio(process.env.ACCOUNTSID, process.env.AUTHTOKEN);
const serviceSid = process.env.SERVICESID;

router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Get all users
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
});

router.post("/create/user/new", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "📌 Phone number is required.",
      });
    }

    // Just send OTP via Twilio (no user creation yet)
    await client.verify.v2.services(serviceSid).verifications.create({
      to: `+91${number}`,
      channel: "sms"
    });

    return res.status(200).json({
      data: {
        success: true,
        message: "📩 OTP sent to the number",
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { number, otp, name = "", location = "", id } = req.body;

    if (!number || !otp) {
      return res.status(400).json({
        success: false,
        message: "📌 Number and OTP are required"
      });
    }

    // ✅ Verify OTP using Twilio
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks.create({
        to: `+91${number}`,
        code: otp,
      });

    if (verificationCheck.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: "❌ Invalid or expired OTP",
      });
    }

    // ✅ Find or create user
    let user = await User.findOne({ number });
    let message = "";

    if (!user) {
      user = await User.create({ name, number, location, order: [] });
      message = "✅ OTP verified. New user created.";
    } else {
      let updated = false;
      if (name.trim() && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (location.trim() && user.location !== location) {
        user.location = location;
        updated = true;
      }
      if (updated) {
        await user.save();
        message = "👤 OTP verified. Existing user updated.";
      } else {
        message = "👤 OTP verified. Existing user found.";
      }
    }

    // ✅ If service `id` is passed, try to find it in Most_booked_services
    if (id) {
     
      const dash = await dashSchema.findOne({ "Most_booked_services._id": id }, { "Most_booked_services.$": 1 });

      if (dash && dash.Most_booked_services && dash.Most_booked_services.length > 0) {
        const service = dash.Most_booked_services[0];

        const alreadyOrdered = user.order?.some(
          (item) => item._id.toString() === service._id.toString()
        );

        if (!alreadyOrdered) {
          user.order = user.order || [];
          user.order.push(service);
          await user.save();
          message += " 🛒 Service booked successfully.";
        } else {
          message += " 🔁 Service already in order.";
        }
      } else {
        message += " ⚠️ Service not found.";
      }
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, number: user.number },
      JWT_SECRET,
      { expiresIn: '1d' }
    );



    return res.status(200).json({
      data: {
        success: true,
        message,
        token,
        user,
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "❌ OTP verification failed",
      error: err?.message || "Unknown server error",
    });
  }
});

router.get("/auth/check", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found",
      });
    }

    res.status(200).json({
     data:{
       success: true,
      message: "✅ Token is valid",
      user,
     }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Server error during auth check",
    });
  }
});

module.exports = router;