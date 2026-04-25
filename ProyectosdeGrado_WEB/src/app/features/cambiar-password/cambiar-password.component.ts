import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.scss',
})
export class CambiarPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(NavigationService);

  passwordActual = '';
  passwordNuevo = '';
  confirmarPassword = '';
  cargando = false;
  error = '';
  mensaje = '';

  submit(): void {
    if (this.cargando) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    if (!this.passwordActual || !this.passwordNuevo || !this.confirmarPassword) {
      this.error = 'Debe completar todos los campos.';
      return;
    }

    if (this.passwordNuevo.length < 8) {
      this.error = 'La nueva contrasena debe tener al menos 8 caracteres.';
      return;
    }

    if (this.passwordNuevo !== this.confirmarPassword) {
      this.error = 'La confirmacion de contrasena no coincide.';
      return;
    }

    if (this.passwordActual === this.passwordNuevo) {
      this.error = 'La nueva contrasena debe ser diferente a la actual.';
      return;
    }

    this.cargando = true;
    this.auth
      .cambiarPassword({
        password_actual: this.passwordActual,
        password_nuevo: this.passwordNuevo,
        confirmar_password: this.confirmarPassword,
      })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.mensaje = 'Contrasena actualizada. Debe iniciar sesion nuevamente.';
          this.auth.logout().subscribe(() => this.nav.navigateToLogin());
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
        },
      });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const mensaje = error.error?.mensaje ?? error.error?.detail ?? error.error?.error;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }

    return 'No fue posible actualizar la contrasena. Intente nuevamente.';
  }
}
