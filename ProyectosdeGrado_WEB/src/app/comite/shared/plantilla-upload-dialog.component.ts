import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlantillasService } from '../../shared/plantillas/plantillas.service';

export interface PlantillaUploadData {
  templateId?: number;
  nombre?: string;
  categoria?: string;
  fase?: string;
  modalidadAplica?: string;
}

export interface PlantillaUploadResult {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-plantilla-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-title-wrapper">
        <h2 mat-dialog-title class="dialog-title" id="plantilla-dialog-title">
          <mat-icon class="title-icon">{{ data.templateId ? 'sync' : 'upload_file' }}</mat-icon>
          <span class="title-text">{{ data.templateId ? 'Reemplazar plantilla' : 'Subir nueva plantilla' }}</span>
        </h2>
      </div>

      <mat-dialog-content class="dialog-content" aria-labelledby="plantilla-dialog-title">
        <p class="dialog-subtitle">Completa la información para publicar una plantilla oficial.</p>

        <form class="form-grid" novalidate>
          <div class="field full-width">
            <label class="field__label" for="templateName">Nombre de la plantilla <span class="required">*</span></label>
            <input
              id="templateName"
              class="field__input"
              [(ngModel)]="nombre"
              name="nombre"
              type="text"
              placeholder="Ej: Propuesta de trabajo de grado"
              required
            />
          </div>

          <div class="field">
            <label class="field__label" for="templateCategory">Categoría (dónde se muestra) <span class="required">*</span></label>
            <select id="templateCategory" class="field__select" [(ngModel)]="categoria" name="categoria" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Asesor">Asesor</option>
              <option value="Jurado">Jurado</option>
              <option value="General">General</option>
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="templateFase">Fase del proyecto <span class="required">*</span></label>
            <select id="templateFase" class="field__select" [(ngModel)]="fase" name="fase" required>
              <option value="" disabled>Selecciona una fase</option>
              <option value="INSCRIPCION">Inscripción</option>
              <option value="APROBACION">Aprobación</option>
              <option value="DESARROLLO">Desarrollo</option>
              <option value="CULMINACION">Culminación</option>
              <option value="EVALUACION">Evaluación</option>
            </select>
          </div>

          <div class="field full-width">
            <label class="field__label" for="templateModality">Modalidad <span class="required">*</span></label>
            <select id="templateModality" class="field__select" [(ngModel)]="modalidadAplica" name="modalidadAplica" required>
              <option value="TODAS">Todas las modalidades</option>
              <option value="INVESTIGACION">Solo Investigación</option>
              <option value="INTERACCION_SOCIAL">Solo Interacción Social</option>
              <option value="PASANTIA">Solo Pasantía</option>
            </select>
          </div>

          <section class="file-upload-section full-width" aria-label="Carga de archivo">
            <label class="section-label" for="templateFileInput">Archivo .docx <span class="required">*</span></label>
            <div class="file-dropzone" [class.has-file]="archivo()" (click)="fileInput.click()" role="button" tabindex="0" (keydown.enter)="fileInput.click()" (keydown.space)="fileInput.click(); $event.preventDefault()" aria-describedby="file-help-text">
              <input
                id="templateFileInput"
                type="file"
                accept=".docx"
                (change)="onFileSelected($event)"
                #fileInput
                hidden
              />
              @if (archivo()) {
                <div class="file-info">
                  <mat-icon class="file-icon">insert_drive_file</mat-icon>
                  <div class="file-details">
                    <span class="file-name">{{ archivo()!.name }}</span>
                    <span class="file-size">{{ formatFileSize(archivo()!.size) }}</span>
                  </div>
                  <button mat-icon-button color="warn" type="button" aria-label="Quitar archivo seleccionado" (click)="clearFile(); $event.stopPropagation()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              } @else {
                <div class="upload-placeholder">
                  <mat-icon>cloud_upload</mat-icon>
                  <span>Haz clic para seleccionar archivo</span>
                </div>
              }
            </div>
            <p class="field-help" id="file-help-text">Solo archivos .docx. Este campo es obligatorio.</p>
          </section>
        </form>

        @if (error()) {
          <div class="message error">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        }

        @if (loading()) {
          <div class="message loading">
            <mat-spinner diameter="20"></mat-spinner>
            <span>Subiendo plantilla...</span>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button type="button" (click)="close()" [disabled]="loading()">
          Cancelar
        </button>
        <button
          mat-flat-button
          color="primary"
          class="save-button"
          type="button"
          [disabled]="loading()"
          (click)="save()"
          [attr.aria-disabled]="loading()"
        >
          <mat-icon class="button-icon">{{ data.templateId ? 'sync' : 'upload' }}</mat-icon>
          <span class="button-text">{{ data.templateId ? 'Reemplazar' : 'Subir' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        width: 100%;
        max-width: 860px;
        overflow: hidden;
        border-radius: 16px;
      }

      .dialog-title-wrapper {
        width: 100%;
      }

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        padding: 1rem 1.25rem;
        background: #f8fbff;
        border-bottom: 1px solid #e2e8f0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #1e293b !important;
        width: 100%;
        min-height: 56px;
      }

      .title-icon {
        flex-shrink: 0;
        color: #1976d2;
        display: flex !important;
      }

      .title-text {
        flex: 1;
        color: #1e293b !important;
        font-weight: 600;
      }

      .dialog-content {
        padding: 1.25rem;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 65vh;
      }

      .dialog-subtitle {
        margin: 0 0 1rem;
        color: #64748b;
        font-size: 0.9rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        width: 100%;
        min-width: 0;
      }

      .field {
        width: 100%;
        min-width: 0;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .field__label {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 2px;
      }

      .field__input,
      .field__select {
        width: 100%;
        height: 40px;
        padding: 0 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        color: #111827;
        background: #ffffff;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
      }

      .field__input::placeholder,
      .field__textarea::placeholder {
        color: #9ca3af;
        font-size: 13px;
      }

      .field__input:focus,
      .field__select:focus,
      .field__textarea:focus {
        border-color: #003087;
        box-shadow: 0 0 0 3px rgba(0, 48, 135, 0.1);
      }

      .field__textarea {
        width: 100%;
        min-height: 80px;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        color: #111827;
        background: #ffffff;
        outline: none;
        resize: vertical;
        font-family: 'Roboto', sans-serif;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }

      .file-upload-section {
        margin-top: 0.25rem;
      }

      .section-label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.86rem;
        font-weight: 600;
        color: #334155;
      }

      .required {
        color: #dc2626;
      }

      .file-dropzone {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 112px;
        padding: 1rem;
        border: 2px dashed #cbd5e1;
        border-radius: 10px;
        background: #f8fafc;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .file-dropzone:hover,
      .file-dropzone:focus-visible {
        border-color: #1976d2;
        background: #eff6ff;
        outline: none;
      }

      .file-dropzone.has-file {
        border: 2px solid #16a34a;
        border-style: solid;
        background: #f0fdf4;
        border-color: #16a34a;
        box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        color: #64748b;
        text-align: center;
      }

      .upload-placeholder mat-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: #94a3b8;
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        min-width: 0;
      }

      .file-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #16a34a;
        flex-shrink: 0;
      }

      .file-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 0.25rem;
      }

      .file-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-size {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 500;
      }

      .field-help {
        margin: 0.4rem 0 0;
        font-size: 0.76rem;
        color: #64748b;
      }

      .message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
      }

      .message.error {
        background: #fef2f2;
        color: #dc2626;
      }

      .message.loading {
        background: #eff6ff;
        color: #1976d2;
      }

      .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.25rem;
        background: #f8fbff;
        border-top: 1px solid #e2e8f0;
      }

      .dialog-actions button {
        min-width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .button-icon {
        flex-shrink: 0;
        display: flex !important;
      }

      .button-text {
        font-weight: 600;
        white-space: nowrap;
        color: inherit !important;
      }

      .save-button {
        background: #003087 !important;
        color: #ffffff !important;
        font-weight: 600;
      }

      .save-button:hover:not([disabled]) {
        background: #002160 !important;
      }

      .save-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        background: #cbd5e1 !important;
        color: #64748b !important;
      }

      @media (max-width: 600px) {
        .dialog-container {
          max-width: 100%;
        }

        .dialog-title {
          padding: 1rem;
        }

        .dialog-content {
          padding: 1rem;
          max-height: 70vh;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .full-width {
          grid-column: auto;
        }

        .dialog-actions {
          padding: 1rem;
          flex-direction: row;
          justify-content: flex-end;
        }

        .dialog-actions button {
          min-width: 96px;
        }
      }

      @media (max-width: 420px) {
        .dialog-actions {
          flex-direction: column-reverse;
        }

        .dialog-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class PlantillaUploadDialogComponent {
  private readonly plantillasService = inject(PlantillasService);
  private readonly snackBar = inject(MatSnackBar);

  nombre = '';
  categoria = '';
  fase = '';
  modalidadAplica = 'TODAS';

  archivo = signal<File | null>(null);
  loading = signal(false);
  error = signal('');

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: PlantillaUploadData,
    private readonly dialogRef: MatDialogRef<PlantillaUploadDialogComponent, PlantillaUploadResult>,
  ) {
    if (data) {
      this.nombre = data.nombre || '';
      this.categoria = data.categoria || '';
      this.fase = data.fase || '';
      this.modalidadAplica = data.modalidadAplica || 'TODAS';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (!file.name.endsWith('.docx')) {
        this.error.set('Solo se aceptan archivos .docx');
        return;
      }
      this.archivo.set(file);
      this.error.set('');
    }
  }

  clearFile(): void {
    this.archivo.set(null);
  }

  private getNombreFinal(): string {
    const manualName = this.nombre.trim();
    if (manualName) {
      return manualName;
    }

    const file = this.archivo();
    if (!file) {
      return '';
    }

    // Fallback UX: if the name field is empty, use the uploaded file name without extension.
    return file.name.replace(/\.docx$/i, '').trim();
  }

  private getValidationMessage(): string {
    if (!this.categoria) {
      return 'Selecciona la categoría de visibilidad.';
    }
    if (!this.fase) {
      return 'Selecciona la fase del proyecto.';
    }
    if (!this.archivo()) {
      return 'Adjunta un archivo .docx para guardar la plantilla.';
    }
    if (!this.getNombreFinal()) {
      return 'Define el nombre de la plantilla o carga un archivo con nombre válido.';
    }
    return '';
  }

  private getHttpErrorMessage(err: unknown, defaultMessage: string): string {
    const error = err as Partial<HttpErrorResponse> & { error?: unknown };

    if (error?.status === 0) {
      return 'No se pudo conectar con la API. Verifica que el backend esté activo en http://localhost:8000.';
    }

    const payload = error?.error as
      | { error?: string; detalle?: string; detail?: string; mensaje?: string }
      | string
      | null
      | undefined;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const fromApi = payload.error || payload.detalle || payload.detail || payload.mensaje;
      if (fromApi) {
        return fromApi;
      }
    }

    if (error?.status === 401) {
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
    if (error?.status === 403) {
      return 'No tienes permisos para subir plantillas.';
    }
    if (error?.status === 400) {
      return 'Los datos enviados no son válidos para guardar la plantilla.';
    }

    return defaultMessage;
  }

  isValid(): boolean {
    return !!(this.getNombreFinal() && this.categoria && this.fase && this.archivo());
  }

  save(): void {
    if (!this.isValid()) {
      this.error.set(this.getValidationMessage());
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = {
      nombre: this.getNombreFinal(),
      categoria: this.categoria,
      fase: this.fase,
      modalidad_aplica: this.modalidadAplica,
      archivo: this.archivo()!,
    };

    if (this.data.templateId) {
      this.plantillasService.actualizar(this.data.templateId, formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.snackBar.open('Plantilla actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close({ success: true, message: 'Plantilla actualizada correctamente' });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error al actualizar plantilla:', err);
          this.error.set(this.getHttpErrorMessage(err, 'Error al actualizar la plantilla'));
        },
      });
    } else {
      this.plantillasService.crear(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.snackBar.open('Plantilla guardada correctamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close({ success: true, message: 'Plantilla subida correctamente' });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error al subir plantilla:', err);
          this.error.set(this.getHttpErrorMessage(err, 'Error al subir la plantilla'));
        },
      });
    }
  }

  close(): void {
    this.dialogRef.close({ success: false });
  }
}