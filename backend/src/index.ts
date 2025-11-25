import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// --- CORRECCIÓN 1: TRUST PROXY (Obligatorio para Render) ---
// Render usa un balanceador de carga que termina el SSL.
// Sin esto, Express cree que la conexión es HTTP insegura y bloquea las cookies "secure".
app.set("trust proxy", 1);
// -----------------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production", // true en producción
    httpOnly: true,
    // --- CORRECCIÓN 2: SAMESITE (Obligatorio para dominios diferentes) ---
    // En producción (Render), el frontend y backend tienen dominios distintos.
    // "none" permite enviar la cookie. "lax" la bloquearía.
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    // ---------------------------------------------------------------------
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true, // Permite recibir cookies del frontend
  })
);

// --- CORRECCIÓN 3: HEALTH CHECK (Para que Render no marque error) ---
// Devuelve 200 OK en la raíz para confirmar que el servidor está vivo.
app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "El servidor está funcionando correctamente 🚀",
      status: "success",
    });
  })
);
// --------------------------------------------------------------------

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});