import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { ActualizarPerfilRequest } from '../../comite/administracion/administracion.types';
import { PerfilService } from './perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly snackBar = inject(MatSnackBar);

  readonly guardando = signal(false);
  readonly cargando = signal(true);

  readonly perfilForm = this.fb.group({
    tipo_documento: ['CEDULA_CIUDADANIA', Validators.required],
    numero_documento: ['', [Validators.required, Validators.pattern(/^\d{5,20}$/)]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    celular: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    correo: [{ value: '', disabled: true }],
  }, { updateOn: 'blur' });

  ngOnInit(): void {
    const usuario = this.auth.usuario;
    if (usuario) {
      this.perfilForm.patchValue({
        tipo_documento: usuario.tipo_documento || 'CEDULA_CIUDADANIA',
        numero_documento: usuario.numero_documento || '',
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        celular: usuario.celular || '',
        correo: usuario.correo || '',
      });
    }

    this.perfilService.obtenerPerfil().subscribe({
      next: (response) => {
        const usuarioApi = response.datos.usuario;
        this.perfilForm.patchValue({
          tipo_documento: usuarioApi.tipo_documento,
          numero_documento: usuarioApi.numero_documento,
          nombre: usuarioApi.nombre,
          apellido: usuarioApi.apellido,
          celular: usuarioApi.celular,
          correo: usuarioApi.correo,
        });
        this.auth.actualizarDatosUsuario(usuarioApi);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const value = this.perfilForm.getRawValue();
    const payload: ActualizarPerfilRequest = {
      tipo_documento: value.tipo_documento ?? undefined,
      numero_documento: value.numero_documento ?? undefined,
      nombre: value.nombre ?? undefined,
      apellido: value.apellido ?? undefined,
      celular: value.celular ?? undefined,
    };

    this.perfilService.actualizarPerfil(payload).subscribe({
      next: (response) => {
        this.auth.actualizarDatosUsuario(response.datos);
        this.perfilForm.patchValue(response.datos);
        this.guardando.set(false);
        this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.guardando.set(false);
        const detalle = error?.error?.error;

        if (detalle && typeof detalle === 'object') {
          Object.entries(detalle as Record<string, string[] | string>).forEach(([campo, valor]) => {
            const mensaje = Array.isArray(valor) ? valor[0] : valor;
            const control = this.perfilForm.get(campo);
            if (control) {
              control.setErrors({ api: mensaje });
              control.markAsTouched();
            }
          });
          return;
        }

        this.snackBar.open(String(detalle || error?.error?.message || 'No fue posible actualizar el perfil.'), 'Cerrar', { duration: 5000 });
      },
    });
  }

  isInvalid(campo: string): boolean {
    const control = this.perfilForm.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  getTipoDocumentoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      CEDULA_CIUDADANIA: 'Cédula de Ciudadanía',
      TARJETA_IDENTIDAD: 'Tarjeta de Identidad',
      CEDULA_EXTRANJERIA: 'Cédula de Extranjería',
      PASAPORTE: 'Pasaporte',
    };
    return labels[tipo] || tipo;
  }

  get fechaRegistroLabel(): string {
    const fecha = this.auth.usuario?.fecha_registro;
    if (!fecha) {
      return 'Sin fecha disponible';
    }
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(fecha));
  }

  get rolesLabel(): string[] {
    return this.auth.usuario?.roles ?? [];
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      ESTUDIANTE: 'Estudiante',
      DOCENTE: 'Docente',
      JURADO: 'Jurado',
      COMITE: 'Comité Curricular',
    };
    return labels[rol] || rol;
  }
}