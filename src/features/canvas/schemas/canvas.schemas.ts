import {
  DESIGN_ID_MISSING,
  NODE_ID_MISSING,
  NODE_POSITION_X_MISSING,
  NODE_POSITION_Y_MISSING,
  PROJECT_ID_MISSING,
} from "@constants/errors";
import { object, TypeOf, number, string } from "zod";

const body = {
  body: object({
    nodes: object({
      id: string({
        required_error: NODE_ID_MISSING,
      }),
      position: object({
        x: number({
          required_error: NODE_POSITION_X_MISSING,
        }),
        y: number({
          required_error: NODE_POSITION_Y_MISSING,
        }),
      }).optional(),
      data: object({}).optional(),
    }).array(),
  }),
};

const paramsForDesignCanvas = {
  params: object({
    design: string({
      required_error: DESIGN_ID_MISSING,
    }),
    project: string({
      required_error: PROJECT_ID_MISSING,
    }),
  }),
};

const paramsForProjectCanvas = {
  params: object({
    project: string({
      required_error: PROJECT_ID_MISSING,
    }),
  }),
};

/**
 * @openapi
 * components:
 *  schemas:
 *    UpdateCanvasRequestBody:
 *      type: object
 *      properties:
 *        node:
 *          type: object
 *          required:
 *            - id
 *          properties:
 *            id:
 *              type: string
 *              example: hhsyen4uud843nd
 *            position:
 *              type: object
 *              properties:
 *                x:
 *                  type: number
 *                  example: 100
 *                y:
 *                  type: number
 *                  example: 100
 *            data:
 *              type: object
 *              additionalProperties: true
 *    UpdateCanvasResponse:
 *      type: object
 *      properties:
 *        data:
 *          $ref: '#/components/schemas/Canvas'
 */
export const updateDesignCanvasRequestSchema = object({
  ...body,
  ...paramsForDesignCanvas,
});
export const updateProjectCanvasRequestSchema = object({
  ...body,
  ...paramsForProjectCanvas,
});

export type UpdateDesignCanvasRequest = TypeOf<typeof updateDesignCanvasRequestSchema>;
export type UpdateProjectCanvasRequest = TypeOf<typeof updateProjectCanvasRequestSchema>;
