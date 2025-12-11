import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * PUBLIC_INTERFACE
 * Guard that allows access only when user is authenticated.
 * If not authenticated, it redirects to /browse and preserves the
 * intended destination in `redirectTo` query param for potential future use.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authed = !!auth.getToken();
  if (authed) return true;

  router.navigate(['/browse'], { queryParams: { redirectTo: state.url } });
  return false;
};
