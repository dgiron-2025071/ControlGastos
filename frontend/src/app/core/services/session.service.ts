import { Injectable, NgZone, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { ToastService } from "./toast.service";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos de inactividad
const CHECK_INTERVAL_MS = 15 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

@Injectable({ providedIn: "root" })
export class SessionService {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private expiryCheckInterval: ReturnType<typeof setInterval> | null = null;
  private listening = false;
  private resetHandler = () => this.restartIdleTimer();

  /** Debe llamarse una vez que el usuario tiene una sesión activa. */
  start(): void {
    if (this.listening || !this.authService.isAuthenticated()) {
      return;
    }

    this.listening = true;

    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach((eventName) =>
        document.addEventListener(eventName, this.resetHandler, { passive: true })
      );

      this.expiryCheckInterval = setInterval(() => this.checkExpiry(), CHECK_INTERVAL_MS);
    });

    this.restartIdleTimer();
  }

  stop(): void {
    if (!this.listening) {
      return;
    }

    this.listening = false;
    ACTIVITY_EVENTS.forEach((eventName) =>
      document.removeEventListener(eventName, this.resetHandler)
    );

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
      this.expiryCheckInterval = null;
    }
  }

  /** Cierra la sesión y notifica al usuario. Usado por inactividad, expiración de JWT o un 401 del backend. */
  expireSession(reason: "idle" | "token" | "unauthorized" = "token"): void {
    if (!this.authService.getToken()) {
      this.stop();
      return;
    }

    this.stop();
    this.authService.logout();

    this.ngZone.run(() => {
      const detail =
        reason === "idle"
          ? "Cerramos tu sesión por inactividad prolongada."
          : undefined;

      this.toastService.error("Su sesión ha expirado. Vuelva a iniciar sesión.", detail);
      this.router.navigate(["/login"]);
    });
  }

  private restartIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => this.expireSession("idle"), IDLE_TIMEOUT_MS);
  }

  private checkExpiry(): void {
    if (this.authService.isTokenExpired()) {
      this.expireSession("token");
    }
  }
}
