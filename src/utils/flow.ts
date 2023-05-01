import { Node } from "@/types";
import { ModelDocument } from "@models/model";
import { FlattenMaps, LeanDocument, Types } from "mongoose";

export function convertModelToNode(
  model: FlattenMaps<
    LeanDocument<
      ModelDocument & {
        _id: Types.ObjectId;
      }
    >
  >
) {
  return {
    id: model._id,
    position: { x: 50, y: 50 },
    data: model.modelSchema,
    type: "model",
  } as Node;
}
