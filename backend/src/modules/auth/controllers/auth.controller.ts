import { Request, Response } from "express";
import { AuthService, AuthError } from "../services/auth.service";
import { AuthenticatedRequest } from "../../../middlewares/auth.middleware";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register({ name, email, password });
      res.status(201).json({ user });
    } catch (error) {
      handleError(error, res);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login({ email, password });
      res.status(200).json({ token, user });
    } catch (error) {
      handleError(error, res);
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getById(req.userId as number);
      res.status(200).json({ user });
    } catch (error) {
      handleError(error, res);
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token, user } = await authService.refresh(req.userId as number);
      res.status(200).json({ token, user });
    } catch (error) {
      handleError(error, res);
    }
  }
}

function handleError(error: unknown, res: Response): void {
  if (error instanceof AuthError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}
