import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  private readonly statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    in_review: { label: 'En Revisión', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    in_correction: { label: 'En Corrección', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    approved: { label: 'Aprobado', className: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-800 border-red-200' },
    in_development: { label: 'En Desarrollo', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    completed: { label: 'Culminado', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    defended: { label: 'Sustentado', className: 'bg-teal-100 text-teal-800 border-teal-200' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    available: { label: 'Disponible', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    downloaded: { label: 'Descargada', className: 'bg-blue-50 text-blue-700 border-blue-100' },
    prefilled: { label: 'Prellenada', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    incomplete: { label: 'Incompleta', className: 'bg-amber-50 text-amber-700 border-amber-100' },
    pending_signature: { label: 'Pendiente de Firma', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    uploaded: { label: 'Subida Nuevamente', className: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    validated: { label: 'Validada', className: 'bg-green-50 text-green-700 border-green-100' },
    rejected_inconsistency: { label: 'Rechazada', className: 'bg-red-50 text-red-700 border-red-100' },
  };

  get config(): { label: string; className: string } {
    return (
      this.statusConfig[this.status] ?? {
        label: this.status,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      }
    );
  }
}
