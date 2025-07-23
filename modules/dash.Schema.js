const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  avg: String,
  name: String,
  rating: Number,
  message: String,
});

const MostBookedServiceSchema = new mongoose.Schema({
  cloudinaryImageId: [String],
  name: String,
  totalRatingsString: String,
  price: Number,
  description: String,
  list: [String],
  review: [ReviewSchema],
});

const ServiceListSchema = new mongoose.Schema({
  name: String,
  icons: String,
});

const ScrollBarServiceSchema = new mongoose.Schema({
  url: String,
  path: String,
});

const ItemsSchema = new mongoose.Schema({
  name: String,
  serviceList: [ServiceListSchema],
  srcollBar_Service: [ScrollBarServiceSchema],
  Most_booked_services: [MostBookedServiceSchema],
});

module.exports = mongoose.model("dashSchema", ItemsSchema);
