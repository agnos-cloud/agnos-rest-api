import mongoose from "mongoose";
import { DEFAULT_ORG_PICTURE } from "@constants/defaults";
import { BaseDocument } from "@models/base";
import MembershipModel, { MembershipDocument } from "@models/membership";
import { UserDocument } from "@models/user";
import logger from "@utils/logger";

export interface OrgInput {
  name: string;
  description?: string;
  email?: string;
  emailIsVerified?: boolean;
  personal?: boolean;
  private?: boolean;
  picture?: string;
  secrets?: object;
  user: UserDocument["_id"];
}

export interface OrgDocument extends BaseDocument, OrgInput, mongoose.Document {
  // resources/components?: Array<ComponentDocument["_id"]>;
  // functions?: Array<FunctionDocument["_id"]>;
  // generators?: Array<GeneratorDocument["_id"]>;
  memberships?: Array<MembershipDocument["_id"]>;
  // plugins?: Array<PluginDocument["_id"]>;
  // projects?: Array<ProjectDocument["_id"]>;
  // teams?: Array<TeamDocument["_id"]>;
  // templates?: Array<TemplateDocument["_id"]>;
}

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // designs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Design" }],
    email: { type: String },
    emailIsVerified: { type: Boolean, default: false },
    // functions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Function" }],
    memberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membership" }],
    personal: { type: Boolean, default: false },
    private: { type: Boolean, default: false },
    picture: { type: String, default: DEFAULT_ORG_PICTURE },
    // plugins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plugin" }],
    secrets: { type: {} },
    // services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

orgSchema.pre("remove", async function (next) {
  const org = this as unknown as OrgDocument;

  MembershipModel.remove({ org: org._id })
    .exec()
    .catch((reason: unknown) => {
      logger.error("Error removing memberships for org", { reason, org: org._id });
    });

  return next();
});

/**
 * @openapi
 * components:
 *  schemas:
 *    Organization:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *          type: string
 *        description:
 *          type: string
 *        email:
 *          type: string
 *        emailIsVerified:
 *          type: boolean
 *        memberships:
 *          type: array
 *          items:
 *            oneOf:
 *              - $ref: '#/components/schemas/Membership'
 *              - type: string
 *        personal:
 *          type: boolean
 *        private:
 *          type: boolean
 *        picture:
 *          type: string
 *        secrets:
 *          type: object
 *          additionalProperties: true
 *        user:
 *          oneOf:
 *            - $ref: '#/components/schemas/User'
 *            - type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 */

const OrgModel = mongoose.model<OrgDocument>("Organization", orgSchema);

export default OrgModel;
