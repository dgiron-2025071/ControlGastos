import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { loginGuard } from "./core/guards/login.guard";

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    canActivate: [loginGuard],
    loadComponent: () =>
      import("./features/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    canActivate: [loginGuard],
    loadComponent: () =>
      import("./features/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: "proximamente",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/proximamente/proximamente.component").then(
        (m) => m.ProximamenteComponent
      ),
  },
  {
    path: "maintenance",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  { path: "**", redirectTo: "login" },
];
