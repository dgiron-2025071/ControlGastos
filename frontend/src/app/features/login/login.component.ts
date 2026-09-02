import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { SessionService } from "../../core/services/session.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  shake = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShake();
      return;
    }

    this.loading.set(true);

    const { email, password } = this.form.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.sessionService.start();
        this.toastService.success(
          "Sesión iniciada correctamente.",
          "Por seguridad, tu sesión expirará después de 20 minutos de inactividad."
        );
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message === "Invalid credentials" || err?.status === 401
            ? "No pudimos iniciar sesión. Verifica tus credenciales e inténtalo nuevamente."
            : "Ocurrió un problema al iniciar sesión. Inténtalo de nuevo en unos segundos."
        );
        this.triggerShake();
      },
    });
  }

  private triggerShake(): void {
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 420);
  }
}
