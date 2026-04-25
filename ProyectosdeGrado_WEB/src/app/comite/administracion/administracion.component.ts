import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ConfirmActionDialogComponent } from '../shared/confirm-action-dialog.component';
import { AdministracionService } from './administracion.service';
import {
  PeriodoAcademicoApi,
  ProyectoApi,
  EstudianteAsignadoApi,
  RolUsuario,
  UsuarioApi,
  crearDocenteRequest,
  crearEstudianteRequest,
} from './administracion.types';

@Component({
  selector: 'app-comite-administracion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTabsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss',
})
export class AdministracionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly adminService = inject(AdministracionService);

  readonly searchUser = signal('');
  readonly roleFilter = signal<'todos' | RolUsuario>('todos');
  readonly statusFilter = signal<'todos' | 'Activo' | 'Inactivo'>('todos');
  readonly selectedTab = signal(0);
  readonly rolSeleccionado = signal<RolUsuario | ''>('');

  readonly filtroDocentes = signal<UsuarioApi[]>([]);
  readonly filtroCoasesores = signal<UsuarioApi[]>([]);
  readonly filtroEstudiantes = signal<UsuarioApi[]>([]);

  private coasesorSearchTerm = '';

  readonly usuarios = signal<UsuarioApi[]>([]);
  readonly periodos = signal<PeriodoAcademicoApi[]>([]);
  readonly proyectos = signal<ProyectoApi[]>([]);

  readonly cargandoUsuarios = signal(false);
  readonly cargandoPeriodos = signal(false);
  readonly cargandoProyectos = signal(false);

  readonly errorUsuarios = signal<string | null>(null);
  readonly errorPeriodos = signal<string | null>(null);
  readonly errorProyectos = signal<string | null>(null);

  readonly enviandoUsuario = signal(false);
  readonly enviandoPeriodo = signal(false);
  readonly enviandoProyecto = signal(false);

  readonly filteredUsers = computed(() => {
    const term = this.searchUser().trim().toLowerCase();
    return this.usuarios().filter((user) => {
      const rolMatch = this.roleFilter() === 'todos' ||
        (this.statusFilter() === 'Inactivo' ? !user.activo :
          this.statusFilter() === 'Activo' ? user.activo :
            user.roles.includes(this.roleFilter() as RolUsuario));
      const estadoMatch = this.statusFilter() === 'todos' ||
        (this.statusFilter() === 'Activo' ? user.activo : !user.activo);
      const buscaMatch = !term ||
        `${user.nombre} ${user.apellido}`.toLowerCase().includes(term) ||
        user.correo.toLowerCase().includes(term);
      return rolMatch && estadoMatch && buscaMatch;
    });
  });

  readonly docentesDisponibles = computed(() =>
    this.usuarios().filter((u) => u.roles.includes('DOCENTE') && u.activo)
  );
  readonly estudiantesDisponibles = computed(() =>
    this.usuarios().filter((u) => u.roles.includes('ESTUDIANTE') && u.activo)
  );
  readonly periodosActivos = computed(() =>
    this.periodos().filter((p) => p.activo)
  );
  readonly periodosDisponiblesProyecto = computed(() =>
    [...this.periodos()].sort((a, b) => Number(Boolean(b.activo)) - Number(Boolean(a.activo)))
  );

  readonly usuarioForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    tipo_documento: ['CEDULA_CIUDADANIA', Validators.required],
    numero_documento: ['', [Validators.required, Validators.pattern(/^\d{5,20}$/)]],
    celular: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: ['', Validators.required],
    rol: ['', Validators.required],
    codigo_estudiante: [''],
    programa: [''],
    promedio_acumulado: [null],
    creditos_aprobados: [null],
    codigo_docente: [''],
    area_conocimiento: [''],
  }, { updateOn: 'blur' });

  readonly periodoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
  }, { updateOn: 'blur' });

  readonly proyectoForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    modalidad: ['', Validators.required],
    subtipo: [''],
    periodoAcademicoId: ['', Validators.required],
    fechaInicio: [''],
    fechaFinEstimada: [''],
    esGrupo: [false],
    esInterdisciplinario: [false],
    asesorId: ['', Validators.required],
    coasesorId: [null],
    estudianteIds: [[], Validators.required],
    estudiantePrincipal: [null as number | null],
  }, { updateOn: 'blur' });

  constructor() {
    this.usuarioForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.rolSeleccionado.set(rol as RolUsuario | '');
      this.actualizarValidacionesPorRol(rol as RolUsuario);
    });
    this.proyectoForm.get('asesorId')?.valueChanges.subscribe(() => {
      const asesorId = Number(this.proyectoForm.get('asesorId')?.value || 0);
      const coasesorId = Number(this.proyectoForm.get('coasesorId')?.value || 0);
      if (asesorId && coasesorId && asesorId === coasesorId) {
        this.proyectoForm.patchValue({ coasesorId: null });
      }
      this.buscarCoasesores(this.coasesorSearchTerm);
    });
    this.proyectoForm.get('modalidad')?.valueChanges.subscribe((mod) => {
      if (mod === 'INTERACCION_SOCIAL') {
        this.proyectoForm.get('subtipo')?.setValidators([Validators.required]);
      } else {
        this.proyectoForm.get('subtipo')?.clearValidators();
      }
      this.proyectoForm.get('subtipo')?.updateValueAndValidity();
    });
    this.proyectoForm.get('esGrupo')?.valueChanges.subscribe((esGrupo) => {
      const ids = this.proyectoForm.get('estudianteIds')?.value as number[];
      if (!esGrupo && ids && ids.length > 1) {
        const soloPrimero = [ids[0]];
        this.proyectoForm.patchValue({ estudianteIds: soloPrimero });
      }
    });
  }

  ngOnInit(): void {
    this.cargandoUsuarios.set(true);
    this.cargandoPeriodos.set(true);
    this.cargandoProyectos.set(true);

    forkJoin({
      usuarios: this.adminService.obtenerUsuarios().pipe(
        catchError(() => {
          this.errorUsuarios.set('Error al cargar usuarios');
          return of({ mensaje: '', datos: [] as UsuarioApi[] });
        }),
      ),
      periodos: this.adminService.obtenerPeriodos().pipe(
        catchError(() => {
          this.errorPeriodos.set('Error al cargar periodos');
          return of({ mensaje: '', datos: [] as PeriodoAcademicoApi[] });
        }),
      ),
      proyectos: this.adminService.obtenerProyectos().pipe(
        catchError(() => {
          this.errorProyectos.set('Error al cargar proyectos');
          return of({ mensaje: '', datos: [] as ProyectoApi[] });
        }),
      ),
    }).subscribe({
      next: ({ usuarios, periodos, proyectos }) => {
        this.usuarios.set(usuarios.datos);
        this.periodos.set(periodos.datos);
        this.proyectos.set((proyectos.datos || []).map((proyecto) => this.normalizarProyecto(proyecto)));
        this.buscarDocentes('');
        this.buscarCoasesores('');
        this.buscarEstudiantes('');
        this.cargandoUsuarios.set(false);
        this.cargandoPeriodos.set(false);
        this.cargandoProyectos.set(false);
      },
      error: () => {
        this.cargandoUsuarios.set(false);
        this.cargandoPeriodos.set(false);
        this.cargandoProyectos.set(false);
        this.snackBar.open('Error al cargar datos. Verifique su conexión.', 'Cerrar', { duration: 5000 });
      },
    });
  }

  private cargarUsuarios(): void {
    this.adminService.obtenerUsuarios().subscribe({
      next: (response) => {
        this.usuarios.set(response.datos);
        this.buscarDocentes('');
        this.buscarCoasesores(this.coasesorSearchTerm);
        this.buscarEstudiantes('');
      },
      error: () => {
        this.snackBar.open('No fue posible actualizar la lista de usuarios.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private cargarPeriodos(periodoSeleccionadoId?: number): void {
    this.adminService.obtenerPeriodos().subscribe({
      next: (response) => {
        this.periodos.set(response.datos);
        if (periodoSeleccionadoId) {
          const existePeriodo = response.datos.some((p) => p.id === periodoSeleccionadoId);
          if (existePeriodo) {
            this.proyectoForm.patchValue({ periodoAcademicoId: periodoSeleccionadoId });
          }
        }
      },
      error: () => {
        this.snackBar.open('No fue posible actualizar la lista de periodos.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private cargarProyectos(): void {
    this.adminService.obtenerProyectos().subscribe({
      next: (response) => {
        this.proyectos.set((response.datos || []).map((proyecto) => this.normalizarProyecto(proyecto)));
      },
      error: () => {
        this.snackBar.open('No fue posible actualizar la lista de proyectos.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private normalizarProyecto(proyecto: ProyectoApi): ProyectoApi {
    const periodoAcademicoId = Number(
      proyecto.periodo_academico_id ?? (proyecto as unknown as { periodo_academico?: number }).periodo_academico,
    );
    const asesorId = Number(proyecto.asesor_id ?? (proyecto as unknown as { asesor?: number }).asesor);

    const asesorDetalle = (proyecto as unknown as {
      asesor_detalle?: { usuario?: { nombre?: string; apellido?: string } };
    }).asesor_detalle;

    const asesorNombreDesdeDetalle = asesorDetalle?.usuario
      ? `${asesorDetalle.usuario.nombre || ''} ${asesorDetalle.usuario.apellido || ''}`.trim()
      : undefined;

    const estudiantesRaw = Array.isArray(proyecto.estudiantes) ? proyecto.estudiantes : [];
    const estudiantesNormalizados: EstudianteAsignadoApi[] = estudiantesRaw.map((estudiante) => {
      const estudianteLike = estudiante as unknown as {
        estudiante_id?: number;
        estudiante?: number;
        es_autor_principal?: boolean;
        estudiante_detalle?: { usuario?: { nombre?: string; apellido?: string } };
      };

      const nombre = estudianteLike.estudiante_detalle?.usuario
        ? `${estudianteLike.estudiante_detalle.usuario.nombre || ''} ${estudianteLike.estudiante_detalle.usuario.apellido || ''}`.trim()
        : undefined;

      return {
        estudiante_id: Number(estudianteLike.estudiante_id ?? estudianteLike.estudiante ?? 0),
        es_autor_principal: Boolean(estudianteLike.es_autor_principal),
        nombre,
      };
    });

    return {
      ...proyecto,
      periodo_academico_id: Number.isFinite(periodoAcademicoId) ? periodoAcademicoId : 0,
      asesor_id: Number.isFinite(asesorId) ? asesorId : 0,
      asesor_nombre: proyecto.asesor_nombre || asesorNombreDesdeDetalle,
      coasesor_nombre: proyecto.coasesor_nombre,
      estudiantes: estudiantesNormalizados,
    };
  }

  private actualizarValidacionesPorRol(rol: RolUsuario): void {
    const controls = this.usuarioForm.controls;
    if (rol === 'ESTUDIANTE') {
      controls['codigo_estudiante'].setValidators([Validators.required]);
      controls['programa'].setValidators([Validators.required]);
      controls['promedio_acumulado'].clearValidators();
      controls['creditos_aprobados'].clearValidators();
      controls['codigo_docente'].clearValidators();
      controls['area_conocimiento'].clearValidators();
    } else {
      controls['codigo_estudiante'].clearValidators();
      controls['programa'].clearValidators();
      controls['promedio_acumulado'].clearValidators();
      controls['creditos_aprobados'].clearValidators();
      controls['codigo_docente'].setValidators([Validators.required]);
      controls['area_conocimiento'].clearValidators();
    }
    Object.keys(controls).forEach((key) => {
      controls[key].updateValueAndValidity();
    });
  }

  isInvalid(campo: string): boolean {
    const control = this.usuarioForm.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  isPeriodoInvalid(campo: string): boolean {
    const control = this.periodoForm.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  hayPeriodoActivo(): boolean {
    return this.periodosActivos().length > 0;
  }

  generarPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.usuarioForm.patchValue({ password });
  }

  createUser(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    const formValue = this.usuarioForm.value;
    this.enviandoUsuario.set(true);

    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Crear usuario',
        message: `¿Estás seguro de crear el usuario "${formValue.nombre} ${formValue.apellido}" con rol ${formValue.rol}?`,
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        const obs = formValue.rol === 'ESTUDIANTE'
          ? this.adminService.crearEstudiante(crearEstudianteRequest(formValue))
          : this.adminService.crearDocente(crearDocenteRequest(formValue));

        obs.subscribe({
          next: () => {
            this.cargarUsuarios();
            this.limpiarFormulario();
            this.enviandoUsuario.set(false);
            this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err: Error) => {
            this.enviandoUsuario.set(false);
            if (err.message.includes('correo')) {
              this.usuarioForm.get('correo')?.setErrors({ api: err.message });
            } else if (err.message.includes('documento')) {
              this.usuarioForm.get('numero_documento')?.setErrors({ api: err.message });
            } else if (err.message.includes('celular')) {
              this.usuarioForm.get('celular')?.setErrors({ api: err.message });
            } else if (err.message.includes('codigo')) {
              const control = formValue.rol === 'ESTUDIANTE' ? 'codigo_estudiante' : 'codigo_docente';
              this.usuarioForm.get(control)?.setErrors({ api: err.message });
            } else {
              this.snackBar.open(err.message, 'Cerrar', { duration: 5000 });
            }
          },
        });
      } else {
        this.enviandoUsuario.set(false);
      }
    });
  }

  limpiarFormulario(): void {
    this.usuarioForm.reset({ rol: 'ESTUDIANTE', tipo_documento: 'CEDULA_CIUDADANIA' });
    this.rolSeleccionado.set('');
  }

  toggleUserStatus(userId: number): void {
    const usuario = this.usuarios().find((u) => u.id === userId);
    if (!usuario) return;

    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: `${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario`,
        message: `¿Estás seguro de ${accion} a ${usuario.nombre} ${usuario.apellido}?`,
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        const obs = usuario.activo
          ? this.adminService.desactivarUsuario(userId)
          : this.adminService.activarUsuario(userId);

        obs.subscribe({
          next: () => {
            this.usuarios.update((users) =>
              users.map((u) => (u.id === userId ? { ...u, activo: !u.activo } : u))
            );
            this.snackBar.open(accion === 'activar' ? 'Usuario activado' : 'Usuario desactivado', 'Cerrar', { duration: 3000 });
          },
          error: (err: Error) => {
            this.snackBar.open(err.message, 'Cerrar', { duration: 5000 });
          },
        });
      }
    });
  }

  createPeriod(): void {
    if (this.periodoForm.invalid) {
      this.periodoForm.markAllAsTouched();
      return;
    }

    if (this.hayPeriodoActivo()) {
      this.snackBar.open('Ya existe un periodo académico activo. Ciérralo antes de crear uno nuevo.', 'Cerrar', { duration: 5000 });
      return;
    }

    this.enviandoPeriodo.set(true);
    const formValue = this.periodoForm.value;

    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Crear periodo académico',
        message: `¿Crear el periodo "${formValue.nombre}" del ${this.formatDateShort(formValue.fecha_inicio)} al ${this.formatDateShort(formValue.fecha_fin)}?`,
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.adminService.crearPeriodo({
          nombre: formValue.nombre,
          fecha_inicio: formValue.fecha_inicio,
          fecha_fin: formValue.fecha_fin,
        }).subscribe({
          next: (res) => {
            this.cargarPeriodos(res.datos.id);
            this.periodoForm.reset();
            this.enviandoPeriodo.set(false);
            this.snackBar.open('Periodo creado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err: Error) => {
            this.enviandoPeriodo.set(false);
            this.snackBar.open(err.message, 'Cerrar', { duration: 5000 });
          },
        });
      } else {
        this.enviandoPeriodo.set(false);
      }
    });
  }

  closePeriod(periodoId: number): void {
    const periodo = this.periodos().find((p) => p.id === periodoId);
    if (!periodo) return;

    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Cerrar periodo académico',
        message: `¿Estás seguro de cerrar el periodo "${periodo.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.adminService.cerrarPeriodo(periodoId).subscribe({
          next: () => {
            this.periodos.update((periodos) =>
              periodos.map((p) => (p.id === periodoId ? { ...p, activo: false } : p))
            );
          },
          error: (err: Error) => {
            this.snackBar.open(err.message, 'Cerrar', { duration: 5000 });
          },
        });
      }
    });
  }

  buscarDocentes(term: string): void {
    const t = term.toLowerCase();
    this.filtroDocentes.set(
      this.docentesDisponibles().filter(
        (d) => d.codigo_docente?.toLowerCase().includes(t) ||
          `${d.nombre} ${d.apellido}`.toLowerCase().includes(t) ||
          d.area_conocimiento?.toLowerCase().includes(t)
      )
    );
  }

  buscarCoasesores(term: string): void {
    this.coasesorSearchTerm = term;
    const t = term.toLowerCase();
    const asesorId = Number(this.proyectoForm.get('asesorId')?.value || 0);
    this.filtroCoasesores.set(
      this.docentesDisponibles().filter(
        (d) => d.id !== asesorId && (
          d.codigo_docente?.toLowerCase().includes(t) ||
          `${d.nombre} ${d.apellido}`.toLowerCase().includes(t) ||
          d.area_conocimiento?.toLowerCase().includes(t)
        )
      )
    );
  }

  buscarEstudiantes(term: string): void {
    const t = term.toLowerCase();
    this.filtroEstudiantes.set(
      this.estudiantesDisponibles().filter(
        (e) => e.codigo_estudiante?.toLowerCase().includes(t) ||
          `${e.nombre} ${e.apellido}`.toLowerCase().includes(t) ||
          e.programa?.toLowerCase().includes(t)
      )
    );
  }

  toggleEstudiante(estudianteId: number): void {
    const current = this.proyectoForm.get('estudianteIds')?.value as number[];
    const estaSeleccionado = current.includes(estudianteId);
    let nuevosIds: number[];

    if (estaSeleccionado) {
      nuevosIds = current.filter((id) => id !== estudianteId);
      if (this.proyectoForm.get('estudiantePrincipal')?.value === estudianteId) {
        this.proyectoForm.patchValue({ estudiantePrincipal: null });
      }
    } else {
      if (!this.proyectoForm.get('esGrupo')?.value && current.length >= 1) {
        this.snackBar.open('Solo puedes seleccionar 1 estudiante para proyectos individuales', 'Cerrar', { duration: 3000 });
        return;
      }
      nuevosIds = [...current, estudianteId];
    }
    this.proyectoForm.patchValue({ estudianteIds: nuevosIds });
  }

  crearProyecto(): void {
    const form = this.proyectoForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.enviandoProyecto.set(true);
    const formValue = form.value;
    const periodoAcademicoId = Number(formValue.periodoAcademicoId);
    const asesorId = Number(formValue.asesorId);
    const periodo = this.periodos().find((p) => p.id === periodoAcademicoId);
    const asesor = this.usuarios().find((u) => u.id === asesorId);

    let nombresEst = '';
    formValue.estudianteIds.forEach((estId: number, index: number) => {
      const est = this.usuarios().find((u) => u.id === estId);
      if (est) {
        const esPrincipal = formValue.estudiantePrincipal === estId;
        nombresEst += `${est.nombre} ${est.apellido}${esPrincipal ? ' (Autor principal)' : ''}`;
        if (index < formValue.estudianteIds.length - 1) nombresEst += ', ';
      }
    });

    const mensaje = `<strong>Proyecto:</strong> ${formValue.nombre}<br/>
      <strong>Modalidad:</strong> ${formValue.modalidad}${formValue.subtipo ? ` / ${formValue.subtipo}` : ''}<br/>
      <strong>Periodo:</strong> ${periodo?.nombre || 'Sin periodo'}<br/>
      <strong>Asesor:</strong> ${asesor ? `${asesor.nombre} ${asesor.apellido}` : 'Sin asignar'}<br/>
      <strong>Coasesor:</strong> ${formValue.coasesorId ? this.getNombreUsuarioPorId(Number(formValue.coasesorId)) : 'Sin asignar'}<br/>
      <strong>Estudiantes:</strong> ${nombresEst || 'Sin asignar'}`;

    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Crear proyecto',
        message: mensaje,
        allowHtml: true,
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.adminService.crearProyecto({
          nombre: formValue.nombre,
          modalidad: formValue.modalidad,
          subtipo: formValue.subtipo || undefined,
          periodo_academico_id: periodoAcademicoId,
          asesor_id: asesorId,
          coasesor_id: formValue.coasesorId ? Number(formValue.coasesorId) : null,
          es_grupo: formValue.esGrupo,
          es_interdisciplinario: formValue.esInterdisciplinario,
          fecha_inicio: formValue.fechaInicio || undefined,
          fecha_fin_estimada: formValue.fechaFinEstimada || undefined,
          estudiantes: formValue.estudianteIds.map((estId: number) => ({
            estudiante_id: estId,
            es_autor_principal: formValue.estudiantePrincipal === estId,
          })),
        }).subscribe({
          next: () => {
            this.cargarProyectos();
            form.reset();
            this.enviandoProyecto.set(false);
            this.snackBar.open('Proyecto creado y asignaciones realizadas exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err: Error) => {
            this.enviandoProyecto.set(false);
            this.snackBar.open(err.message, 'Cerrar', { duration: 5000 });
          },
        });
      } else {
        this.enviandoProyecto.set(false);
      }
    });
  }

  isPasoInformacionCompleto(): boolean {
    return Boolean(
      this.proyectoForm.get('nombre')?.valid
      && this.proyectoForm.get('modalidad')?.valid
      && this.proyectoForm.get('periodoAcademicoId')?.valid
      && (this.proyectoForm.get('modalidad')?.value !== 'INTERACCION_SOCIAL' || this.proyectoForm.get('subtipo')?.valid),
    );
  }

  isPasoAsesorCompleto(): boolean {
    return Boolean(this.proyectoForm.get('asesorId')?.valid);
  }

  getNombreCompleto(u: UsuarioApi): string {
    return `${u.nombre} ${u.apellido}`;
  }

  getNombreUsuarioPorId(userId: number): string {
    const usuario = this.usuarios().find((u) => u.id === userId);
    return usuario ? this.getNombreCompleto(usuario) : 'Usuario no encontrado';
  }

  getRolesString(u: UsuarioApi): string {
    return u.roles.join(', ');
  }

  formatDateShort(date: string): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
  }

  getBadgeClass(activo: boolean): string {
    return activo ? 'badge-active' : 'badge-inactive';
  }

  getFaseBadgeClass(fase: string): string {
    const map: Record<string, string> = {
      INSCRIPCION: 'badge-inscripcion',
      APROBACION: 'badge-aprobacion',
      DESARROLLO: 'badge-desarrollo',
      CULMINACION: 'badge-culminacion',
      EVALUACION: 'badge-evaluacion',
    };
    return map[fase] || '';
  }

  getEstadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      ACTIVO: 'badge-active',
      FINALIZADO: 'badge-finalizado',
      CANCELADO: 'badge-cancelado',
    };
    return map[estado] || '';
  }

  getNombrePeriodo(periodoId: number): string {
    const p = this.periodos().find((p) => p.id === periodoId);
    return p?.nombre || 'Sin periodo';
  }

  getNombreAsesor(proyecto: ProyectoApi): string {
    if (proyecto.asesor_nombre) {
      return proyecto.asesor_nombre;
    }

    const asesorUsuario = this.usuarios().find((u) => u.id === proyecto.asesor_id);
    return asesorUsuario ? `${asesorUsuario.nombre} ${asesorUsuario.apellido}` : '';
  }

  getNombreCoasesor(proyecto: ProyectoApi): string {
    const coasesorId = Number((proyecto as unknown as { coasesor?: number; coasesor_id?: number }).coasesor_id ?? (proyecto as unknown as { coasesor?: number }).coasesor ?? 0);
    const coasesorNombre = proyecto.coasesor_nombre;
    if (coasesorNombre) {
      return coasesorNombre;
    }

    const coasesorUsuario = this.usuarios().find((u) => u.id === coasesorId);
    return coasesorUsuario ? `${coasesorUsuario.nombre} ${coasesorUsuario.apellido}` : '';
  }

  getNombresEstudiantes(estudiantes: { estudiante_id: number; nombre?: string }[]): string {
    if (!estudiantes || estudiantes.length === 0) return '';
    return estudiantes.map((e) => {
      if (e.nombre) {
        return e.nombre;
      }
      const est = this.usuarios().find((u) => u.id === e.estudiante_id);
      return est ? `${est.nombre} ${est.apellido}` : '';
    }).filter(Boolean).join(', ');
  }

  saveDeadlines(): void {
    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Guardar plazos por defecto',
        message: 'Se actualizarán los plazos estándar del reglamento.',
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.snackBar.open('Plazos guardados exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveParams(): void {
    this.dialog.open(ConfirmActionDialogComponent, {
      data: {
        title: 'Guardar parámetros generales',
        message: 'Se guardarán los parámetros institucionales del sistema.',
        confirmText: 'Sí',
        cancelText: 'No',
      },
    }).afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.snackBar.open('Parámetros guardados exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }
}