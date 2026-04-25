import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NavigationService } from '../../core/navigation.service';
import { LoginRequest, RolUsuario } from '../../core/auth.types';

interface LoginRoleOption {
  value: RolUsuario;
  label: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(NavigationService);
  private rotationIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly loginImages = [
    { src: 'img/facing.png', alt: 'Edificio institucional principal' },
    { src: 'img/sinergia.jpg', alt: 'Trabajo colaborativo universitario' },
    { src: 'img/image.png', alt: 'Espacio academico del campus' },
  ];

  readonly roles: LoginRoleOption[] = [
    { value: 'JURADO', label: 'Jurado' },
    { value: 'DOCENTE', label: 'Asesor' },
    { value: 'ESTUDIANTE', label: 'Estudiante' },
    { value: 'COMITE', label: 'Comite Curricular' },
  ];

  correo = '';
  password = '';
  selectedRole: RolUsuario = 'ESTUDIANTE';
  currentImageIndex = 0;
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.rotationIntervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.loginImages.length;
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.rotationIntervalId) {
      clearInterval(this.rotationIntervalId);
    }
  }

  selectedRoleLabel(): string {
    return this.roles.find((role) => role.value === this.selectedRole)?.label ?? 'Estudiante';
  }

  currentImage() {
    return this.loginImages[this.currentImageIndex];
  }

  submit(): void {
    if (this.cargando) {
      return;
    }

    this.error = '';
    this.cargando = true;

    const datos: LoginRequest = {
      correo: this.correo.trim(),
      password: this.password,
      rol: this.selectedRole,
    };

    this.auth
      .login(datos)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (response) => {
          if (response.datos.debe_cambiar_password) {
            this.nav.navigate('change-password');
            return;
          }
          this.nav.navigateToRoleDashboard(response.datos.rol_sesion);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
        },
      });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifique su conexion.';
      }

      const mensaje = error.error?.mensaje ?? error.error?.detail ?? error.error?.error;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }

    return 'No fue posible iniciar sesion. Intente nuevamente.';
  }
}
