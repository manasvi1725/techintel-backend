"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Technology = void 0;
var mongoose_1 = require("mongoose");
var Schema = mongoose_1.default.Schema, model = mongoose_1.default.model, models = mongoose_1.default.models;
var TechnologySchema = new Schema({
    name: { type: String, required: true, unique: true },
    latest_json: { type: Schema.Types.Mixed, default: null },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Technology = models.Technology || model("Technology", TechnologySchema);
export default Technology
