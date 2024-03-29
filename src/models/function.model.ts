import mongoose from "mongoose";
import { DEFAULT_FUNCTION_PICTURE } from "@constants/defaults";
import { BaseDocument } from "@models/base";
import FunctionVersionModel, { FunctionVersionDocument } from "./functionVersion.model";
import TeamModel, { TeamDocument } from "./team.model";
import { UserDocument } from "@models/user";

export interface FunctionInput {
  name: string;
  description?: string;
  picture?: string;
  private?: boolean;
  secrets?: object;
  team: TeamDocument["_id"]; // ref to the team that created this plugin
  user: UserDocument["_id"]; // ref to the user that created this plugin
}

export interface FunctionDocument extends BaseDocument, FunctionInput, mongoose.Document {
  versions?: Array<FunctionVersionDocument["_id"]>;
}

const functionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    picture: { type: String, default: DEFAULT_FUNCTION_PICTURE },
    private: { type: Boolean, default: false },
    secrets: { type: {} },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    versions: [{ type: String, ref: "FunctionVersion" }],
  },
  {
    timestamps: true,
  }
);

functionSchema.pre("remove", async function (next) {
  const func = this as unknown as FunctionDocument;

  TeamModel.updateMany({ functions: func._id }, { $pull: { functions: func._id } })
    .exec()
    .catch(() => {
      // TODO: what do we do?
    });
  FunctionVersionModel.remove({ function: func._id })
    .exec()
    .catch(() => {
      // TODO: what do we do?
    });

  return next();
});

const FunctionModel = mongoose.model<FunctionDocument>("Function", functionSchema);

export default FunctionModel;
