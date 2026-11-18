const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: "" },
  course: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1, max: 8 },
  dateOfBirth: { type: Date },
  address: { type: String, trim: true, default: "" }
}, { timestamps: true });

studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Student", studentSchema);