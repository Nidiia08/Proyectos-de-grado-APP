import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmActionDialogData {
  title: string;
  message: string;
  confirmText: string;
  observationLabel?: string;
  observationPlaceholder?: string;
  requireObservation?: boolean;
}

export interface ConfirmActionDialogResult {
  confirmed: boolean;
  observation: string;
}

@Component({
  selector: 'app-confirm-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="dialog-content">
      <p>{{ data.message }}</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ data.observationLabel || 'Observación' }}</mat-label>
        <textarea
          matInput
          rows="4"
          [(ngModel)]="observation"
          [placeholder]="data.observationPlaceholder || 'Ingrese una observación para el registro'"
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="close(false)">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="data.requireObservation && !observation.trim()"
        (click)="close(true)"
      >
        {{ data.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: min(36rem, 80vw);
      }

      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class ConfirmActionDialogComponent {
  observation = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmActionDialogData,
    private readonly dialogRef: MatDialogRef<ConfirmActionDialogComponent, ConfirmActionDialogResult>,
  ) {}

  close(confirmed: boolean): void {
    this.dialogRef.close({
      confirmed,
      observation: this.observation.trim(),
    });
  }
}
