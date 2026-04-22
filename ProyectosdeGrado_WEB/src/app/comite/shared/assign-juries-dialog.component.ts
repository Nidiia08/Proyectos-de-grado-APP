import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JuradoAsignado } from '../comite.service';

@Component({
  selector: 'app-assign-juries-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Asignación de jurados</h2>
    <mat-dialog-content class="dialog-grid">
      <mat-form-field appearance="outline">
        <mat-label>Jurado 1</mat-label>
        <mat-select [(ngModel)]="firstId">
          @for (item of data.available; track item.id) {
            <mat-option [value]="item.id">{{ item.nombre }} · {{ item.area }} · Carga {{ item.cargaActual }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Jurado 2</mat-label>
        <mat-select [(ngModel)]="secondId">
          @for (item of data.available; track item.id) {
            <mat-option [value]="item.id">{{ item.nombre }} · {{ item.area }} · Carga {{ item.cargaActual }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Observación opcional</mat-label>
        <textarea matInput rows="4" [(ngModel)]="observation"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" type="button" [disabled]="!firstId || !secondId || firstId===secondId" (click)="submit()">Confirmar asignación</button>
    </mat-dialog-actions>
  `,
  styles: [`.dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;min-width:min(42rem,80vw)} .full{grid-column:1 / -1} @media (max-width:768px){.dialog-grid{grid-template-columns:1fr;}}`],
})
export class AssignJuriesDialogComponent {
  firstId: number | null = null;
  secondId: number | null = null;
  observation = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: { available: JuradoAsignado[] },
    readonly dialogRef: MatDialogRef<AssignJuriesDialogComponent>,
  ) {}
  submit(): void {
    this.dialogRef.close({
      juries: this.data.available.filter((item) => item.id === this.firstId || item.id === this.secondId),
      observation: this.observation.trim(),
    });
  }
}
