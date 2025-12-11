import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError, retryWhen, scan, delayWhen, timer } from 'rxjs';

/**
 * PUBLIC_INTERFACE
 * Error interceptor that:
 * - Retries idempotent GET requests with a short exponential backoff (max 3 attempts)
 *   for network errors and 5xx errors.
 * - Maps errors into user-friendly messages.
 *   It rethrows an HttpErrorResponse with a normalized error message in `error`.
 */
export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const isGet = req.method.toUpperCase() === 'GET';

  const retryable = (err: unknown) => {
    if (!(err instanceof HttpErrorResponse)) return false;
    // Network error: status 0, or server errors 5xx
    return err.status === 0 || (err.status >= 500 && err.status < 600);
  };

  const withRetry$ = next(req).pipe(
    // Retry only for GET requests for network/5xx with small backoff: 150ms, 300ms, 600ms
    isGet
      ? retryWhen(errors =>
          errors.pipe(
            scan((acc: number, error: unknown) => {
              if (!retryable(error) || acc >= 2) {
                // Stop retrying after 3 total attempts (initial + 2 retries)
                throw error;
              }
              return acc + 1;
            }, 0),
            // Delay dynamically using timer to avoid invalid overload to delay()
            delayWhen((attemptCount: number) => {
              const ms = 150 * Math.pow(2, attemptCount); // 150, 300, 600
              return timer(ms);
            })
          )
        )
      : (src => src)
  );

  return withRetry$.pipe(
    catchError((error: unknown) => {
      let message = 'Unexpected error occurred. Please try again.';
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          message = 'Network error. Please check your connection.';
        } else if (error.status >= 500) {
          message = 'Server is unavailable. Please try again later.';
        } else if (error.status === 401) {
          message = 'You are not authorized. Please login again.';
        } else if (error.status === 403) {
          message = 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
          message = 'Requested resource was not found.';
        } else if (error.status >= 400 && error.status < 500) {
          message = 'Request error. Please verify your input and try again.';
        }

        // Re-emit an HttpErrorResponse preserving original details but normalizing message
        const friendly = new HttpErrorResponse({
          error: { message },
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
        });
        return throwError(() => friendly);
      }
      return throwError(() => error);
    })
  );
}
