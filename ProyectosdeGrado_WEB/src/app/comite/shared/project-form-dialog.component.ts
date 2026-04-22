import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Registrar nuevo proyecto</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline"><mat-label>Estudiante(s)</mat-label><input matInput formControlName="estudiantes" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Modalidad</mat-label><mat-select formControlName="modalidad"><mat-option value="Investigación">Investigación</mat-option><mat-option value="Interacción Social">Interacción Social</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Subtipo</mat-label><mat-select formControlName="subtipo"><mat-option value="Grupo de investigación">Grupo de investigación</mat-option><mat-option value="Pasantía">Pasantía</mat-option><mat-option value="Proyecto de Desarrollo de Software">Proyecto de Desarrollo de Software</mat-option><mat-option value="Proyecto de Intervención">Proyecto de Intervención</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Nombre del proyecto</mat-label><input matInput formControlName="nombre" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Asesor/Director</mat-label><input matInput formControlName="asesor" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Periodo</mat-label><input matInput formControlName="periodo" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Fecha de inicio</mat-label><input matInput type="date" formControlName="fechaInicio" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Duración estimada</mat-label><mat-select formControlName="duracionMeses"><mat-option [value]="6">6 meses</mat-option><mat-option [value]="12">12 meses</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Grupo de investigación</mat-label><input matInput formControlName="grupoInvestigacion" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="submit()">Crear</button>
    </mat-dialog-actions>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;min-width:min(48rem,85vw)} @media (max-width:768px){.grid{grid-template-columns:1fr;}}`],
})
export class ProjectFormDialogComponent {
  readonly form;
  constructor(private readonly fb: FormBuilder, readonly dialogRef: MatDialogRef<ProjectFormDialogComponent>) {
    this.form = this.fb.group({
      estudiantes: ['', Validators.required],
      modalidad: ['Investigación', Validators.required],
      subtipo: ['Grupo de investigación', Validators.required],
      nombre: ['', Validators.required],
      asesor: ['', Validators.required],
      periodo: ['2026-A', Validators.required],
      fechaInicio: ['2026-04-12', Validators.required],
      duracionMeses: [6, Validators.required],
      grupoInvestigacion: [''],
    });
  }
  submit(): void {
    const value = this.form.getRawValue();
    this.dialogRef.close({
      estudiantes: (value.estudiantes || '').split(',').map((item) => item.trim()).filter(Boolean),
      modalidad: value.modalidad || 'Investigación',
      subtipo: value.subtipo || 'Grupo de investigación',
      nombre: value.nombre || '',
      asesor: value.asesor || '',
      periodo: value.periodo || '2026-A',
      fechaInicio: value.fechaInicio || '2026-04-12',
      duracionMeses: Number(value.duracionMeses) || 6,
      grupoInvestigacion: value.grupoInvestigacion || '',
    });
  }
}
