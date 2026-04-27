import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Plantilla {
  id: number;
  nombre: string;
  categoria: string;
  fase: string;
  modalidad_aplica: string;
  archivo_url: string;
  fecha_actualizacion: string;
  subida_por: number;
  subida_por_nombre: string;
}

@Injectable({ providedIn: 'root' })
export class PlantillasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _plantillas = signal<Plantilla[]>([]);
  readonly plantillas = this._plantillas.asReadonly();

  cargar(categoria?: string, fase?: string, modalidad?: string): void {
    let params = new HttpParams();
    if (categoria) params = params.set('categoria', categoria);
    if (fase) params = params.set('fase', fase);
    if (modalidad) params = params.set('modalidad', modalidad);

    this.http.get<Plantilla[]>(`${this.apiUrl}/plantillas/`, { params }).subscribe({
      next: (data) => this._plantillas.set(data),
      error: (err) => console.error('Error cargando plantillas:', err),
    });
  }

  obtener(id: number): Observable<Plantilla> {
    return this.http.get<Plantilla>(`${this.apiUrl}/plantillas/${id}/`);
  }

  crear(data: { nombre: string; categoria: string; fase: string; modalidad_aplica: string; archivo: File }): Observable<Plantilla> {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('categoria', data.categoria);
    formData.append('fase', data.fase);
    formData.append('modalidad_aplica', data.modalidad_aplica);
    formData.append('archivo_url', data.archivo, data.archivo.name);

    return this.http.post<Plantilla>(`${this.apiUrl}/plantillas/`, formData).pipe(
      tap((nueva) => {
        this._plantillas.update((items) => [nueva, ...items]);
      })
    );
  }

  actualizar(id: number, data: Partial<{ nombre: string; categoria: string; fase: string; modalidad_aplica: string; archivo: File }>): Observable<Plantilla> {
    const formData = new FormData();
    if (data.nombre) formData.append('nombre', data.nombre);
    if (data.categoria) formData.append('categoria', data.categoria);
    if (data.fase) formData.append('fase', data.fase);
    if (data.modalidad_aplica) formData.append('modalidad_aplica', data.modalidad_aplica);
    if (data.archivo) formData.append('archivo_url', data.archivo, data.archivo.name);

    return this.http.patch<Plantilla>(`${this.apiUrl}/plantillas/${id}/`, formData).pipe(
      tap((actualizada) => {
        this._plantillas.update((items) => items.map((item) => (item.id === id ? actualizada : item)));
      })
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plantillas/${id}/`).pipe(
      tap(() => {
        this._plantillas.update((items) => items.filter((item) => item.id !== id));
      })
    );
  }

  descargar(id: number): void {
    this.http.get(`${this.apiUrl}/plantillas/${id}/descargar/`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantilla_${id}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error descargando plantilla:', err),
    });
  }

  obtenerPorCategoria(categoria: string): Plantilla[] {
    return this._plantillas().filter((p) => p.categoria === categoria);
  }

  obtenerPorFase(fase: string): Plantilla[] {
    return this._plantillas().filter((p) => p.fase === fase);
  }
}