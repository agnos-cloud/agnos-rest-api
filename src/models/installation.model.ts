import mongoose from "mongoose";
import { BaseDocument } from "@models/base";
import { PluginDocument } from "./plugin.model";
import { PluginVersionDocument } from "./pluginVersion.model";
import { TeamDocument } from "./team.model";
import { UserDocument } from "@models/user";

export interface InstallationInput {
  plugin: PluginDocument["_id"];
  version: PluginVersionDocument["_id"];
  team: TeamDocument["_id"]; // ref to the team that created this installation
  user: UserDocument["_id"]; // ref to the user that created this installation
}

export interface InstallationDocument extends BaseDocument, InstallationInput, mongoose.Document {}

const installationSchema = new mongoose.Schema(
  {
    plugin: { type: mongoose.Schema.Types.ObjectId, ref: "Plugin" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    version: { type: mongoose.Schema.Types.ObjectId, ref: "PluginVersion" },
  },
  {
    timestamps: true,
  }
);

const InstallationModel = mongoose.model<InstallationDocument>("Installation2", installationSchema);

export default InstallationModel;
