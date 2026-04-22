import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="no-autorizado">
      <div class="no-autorizado__card">
        <span class="no-autorizado__eyebrow">Acceso restringido</span>
        <h1>No autorizado</h1>
        <p>No tienes permisos para acceder a esta seccion con el rol actual.</p>
        <button type="button" (click)="volver()">Volver al inicio</button>
      </div>
    </section>
  `,
  styles: [
    `
      .no-autorizado {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: linear-gradient(135deg, #f4f7fb 0%, #dce6f8 100%);
      }

      .no-autorizado__card {
        width: min(100%, 30rem);
        padding: 2rem;
        border-radius: 1.5rem;
        background: #ffffff;
        box-shadow: 0 20px 50px rgba(0, 38, 89, 0.12);
        text-align: center;
      }

      .no-autorizado__eyebrow {
        display: inline-block;
        margin-bottom: 1rem;
        color: #9a3412;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      h1 {
        margin: 0 0 0.75rem;
        color: #0f172a;
      }

      p {
        margin: 0 0 1.5rem;
        color: #475569;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.85rem 1.4rem;
        background: #0f4c81;
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
      }
    `,
  ],
})
export class NoAutorizadoComponent {
  private readonly router = inject(Router);

  volver(): void {
    void this.router.navigate(['/login']);
  }
}
