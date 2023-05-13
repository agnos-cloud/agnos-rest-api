import { Router } from "express";
import requireUser from "@middleware/requireUser";
import validateResource from "@middleware/validateResource";
import { createProjectRequestSchema, getProjectRequestSchema } from "@schemas/project";
import {
  createProjectDesignHandler,
  createProjectHandler,
  createProjectModelHandler,
  getProjectDesignHandler,
  getProjectDesignsHandler,
  getProjectHandler,
  getProjectsHandler,
  updateProjectCanvasHandler,
  updateProjectDesignCanvasHandler,
} from "@controllers/project";
import checkAuth0AccessToken from "@middleware/checkAuth0AccessToken";
import queryParser from "@middleware/queryParser";
import requireUserRole from "@middleware/requireUserRole";
import { PermissionName, RoleName } from "@constants/permissions";
import requireUserPermission from "@middleware/requireUserPermission";
import { createModelRequestSchema } from "@schemas/model";
import { updateDesignCanvasRequestSchema, updateProjectCanvasRequestSchema } from "@schemas/canvas";
import { createDesignRequestSchema, getDesignRequestSchema, getDesignsRequestSchema } from "@schemas/design";

const router = Router();

/**
 * @openapi
 * '/projects':
 *  get:
 *    summary: Get public projects
 *    description: Get public projects
 *    tags:
 *      - Project
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetProjectsResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 */
// since this endpoint allows you to fetch projects from multiple orgs, we don't need to check for org roles
router.get("/projects", [checkAuth0AccessToken, requireUser, queryParser], getProjectsHandler);

/**
 * @openapi
 * '/projects/{project}':
 *  get:
 *    summary: Get a project
 *    description: Get a project
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetProjectResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 */
router.get(
  "/projects/:project",
  [
    validateResource(getProjectRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.read, "project", "params.project"),
    queryParser,
  ],
  getProjectHandler
);

// TODO: GET /projects/:project/collaborations

/**
 * @openapi
 * '/projects/{project}/designs':
 *  get:
 *    summary: Get project designs
 *    description: Get project designs
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetDesignsResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 */
router.get(
  "/projects/:project/designs",
  [
    validateResource(getDesignsRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.read, "project", "params.project"),
    queryParser,
  ],
  getProjectDesignsHandler
);

/**
 * @openapi
 * '/projects/{project}/designs/{design}':
 *  get:
 *    summary: Get a project design
 *    description: Get a project design
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *      - name: design
 *        in: path
 *        description: Design ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetDesignResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 */
router.get(
  "/projects/:project/designs/:design",
  [
    validateResource(getDesignRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.read, "project", "params.project"),
    queryParser,
  ],
  getProjectDesignHandler
);

/**
 * @openapi
 * '/projects/{project}/canvas':
 *  post:
 *    summary: Update a project's canvas
 *    description: Update a project's canvas
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UpdateCanvasRequestBody'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdateCanvasResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.patch(
  "/projects/:project/canvas",
  [
    validateResource(updateProjectCanvasRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.write, "project", "params.project"),
  ],
  updateProjectCanvasHandler
);

/**
 * @openapi
 * '/projects/{project}/designs/{design}/canvas':
 *  post:
 *    summary: Update a project design's canvas
 *    description: Update a project design's canvas
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *      - name: design
 *        in: path
 *        description: Design ID
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UpdateCanvasRequestBody'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdateCanvasResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.patch(
  "/projects/:project/designs/:design/canvas",
  [
    validateResource(updateDesignCanvasRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.write, "project", "params.project"),
  ],
  updateProjectDesignCanvasHandler
);

/**
 * @openapi
 * '/projects':
 *  post:
 *    summary: Create a project
 *    description: Create a project
 *    tags:
 *      - Project
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateProjectRequestBody'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateProjectResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.post(
  "/projects",
  [
    validateResource(createProjectRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserRole(RoleName.owner, "body.org"),
  ],
  createProjectHandler
);

/**
 * @openapi
 * '/projects/{project}/designs':
 *  post:
 *    summary: Create a project design
 *    description: Create a project design
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateDesignRequestBody'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateDesignResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.post(
  "/projects/:project/designs",
  [
    validateResource(createDesignRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.write, "project", "params.project"),
  ],
  createProjectDesignHandler
);

/**
 * @openapi
 * '/projects/{project}/models':
 *  post:
 *    summary: Create a project model
 *    description: Create a project model
 *    tags:
 *      - Project
 *    parameters:
 *      - name: project
 *        in: path
 *        description: Project ID
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateModelRequestBody'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateModelResponse'
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.post(
  "/projects/:project/models",
  [
    validateResource(createModelRequestSchema),
    checkAuth0AccessToken,
    requireUser,
    requireUserPermission(PermissionName.write, "project", "params.project"),
  ],
  createProjectModelHandler
);

export default router;
