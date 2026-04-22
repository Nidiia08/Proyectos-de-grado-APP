import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';

interface ChatMessage {
  id: number;
  author: string;
  role: string;
  sentAt: string;
  text: string;
  own: boolean;
}

@Component({
  selector: 'app-estudiante-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnDestroy {
  private readonly auth = inject(AuthService);

  draftMessage = '';
  advisorTyping = false;

  readonly role = this.auth.userRole;

  readonly pageTitle = computed(() => {
    const role = this.role();
    if (role === 'professor') return 'Chat con estudiantes y jurados';
    if (role === 'jury') return 'Chat con dirección del proyecto';
    return 'Chat';
  });

  readonly pageSubtitle = computed(() => {
    const role = this.role();
    if (role === 'professor') return 'Conversación directa con estudiantes y jurados del trabajo de grado';
    if (role === 'jury') return 'Comunicación directa con la dirección del trabajo de grado';
    return 'Conversación directa con la dirección del trabajo de grado';
  });

  readonly contactName = computed(() => {
    const role = this.role();
    if (role === 'professor') return 'Laura Marcela Vélez';
    if (role === 'jury') return 'Dra. María López';
    return 'Dra. María López';
  });

  readonly contactRole = computed(() => {
    const role = this.role();
    if (role === 'professor') return 'Estudiante líder';
    if (role === 'jury') return 'Directora';
    return 'Directora';
  });

  readonly projectName = 'Sistema de seguimiento de proyectos';

  readonly ownRoleLabel = computed(() => {
    const role = this.role();
    if (role === 'professor') return 'Director';
    if (role === 'jury') return 'Jurado';
    return 'Estudiante';
  });

  readonly availableStatus = computed(() => {
    return this.advisorTyping ? 'Escribiendo...' : 'Disponible';
  });

  readonly messages: ChatMessage[] = this.buildInitialMessages();

  private nextId = this.messages.length + 1;
  private replyTimerId: number | null = null;

  ngOnDestroy(): void {
    if (this.replyTimerId !== null) {
      window.clearTimeout(this.replyTimerId);
    }
  }

  sendMessage(): void {
    const text = this.draftMessage.trim();
    if (!text) return;

    this.messages.push({
      id: this.nextId++,
      author: 'Tú',
      role: this.ownRoleLabel(),
      sentAt: new Date().toISOString(),
      text,
      own: true,
    });

    this.draftMessage = '';
    this.queueReply(text);
  }

  handleComposerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    this.sendMessage();
  }

  shouldShowDayDivider(index: number): boolean {
    if (index === 0) return true;
    return this.dayKey(this.messages[index].sentAt) !== this.dayKey(this.messages[index - 1].sentAt);
  }

  formatDayLabel(dateValue: string): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (this.dayKey(dateValue) === this.dayKey(today.toISOString())) return 'Hoy';
    if (this.dayKey(dateValue) === this.dayKey(yesterday.toISOString())) return 'Ayer';

    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
    }).format(new Date(dateValue));
  }

  formatTime(dateValue: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateValue));
  }

  getInitials(name: string): string {
    if (name === 'Tú') return 'TU';
    return name
      .replace(/^(Dr|Dra|Prof|Mg)\.?\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  private buildInitialMessages(): ChatMessage[] {
    const role = this.role();

    if (role === 'professor') {
      return [
        {
          id: 1,
          author: 'Laura Marcela Vélez',
          role: 'Estudiante líder',
          sentAt: '2026-04-10T08:30:00',
          text: 'Profesora, compartimos la nueva versión del documento y queremos validar si el alcance quedó correcto.',
          own: false,
        },
        {
          id: 2,
          author: 'Tú',
          role: 'Director',
          sentAt: '2026-04-10T09:10:00',
          text: 'Sí, el alcance va mejor. Revisen ahora la parte metodológica y dejen listos los objetivos específicos.',
          own: true,
        },
        {
          id: 3,
          author: 'Carlos Ruiz',
          role: 'Jurado',
          sentAt: '2026-04-10T10:00:00',
          text: 'Cuando tengan la siguiente versión me la comparten por este chat para revisarla antes del comité.',
          own: false,
        },
      ];
    }

    if (role === 'jury') {
      return [
        {
          id: 1,
          author: 'Dra. María López',
          role: 'Directora',
          sentAt: '2026-04-10T08:30:00',
          text: 'Jurado, les compartiremos hoy el documento final para que puedan iniciar la revisión.',
          own: false,
        },
        {
          id: 2,
          author: 'Tú',
          role: 'Jurado',
          sentAt: '2026-04-10T08:55:00',
          text: 'Perfecto. En cuanto lo reciba, les envío observaciones iniciales por este medio.',
          own: true,
        },
        {
          id: 3,
          author: 'Dra. María López',
          role: 'Directora',
          sentAt: '2026-04-11T09:05:00',
          text: 'Muchas gracias. Queremos dejar lista la revisión antes de programar la socialización.',
          own: false,
        },
      ];
    }

    return [
      {
        id: 1,
        author: 'Dra. María López',
        role: 'Directora',
        sentAt: '2026-04-10T08:30:00',
        text: 'Por favor actualicen el diagrama de casos de uso según lo conversado en la última reunión.',
        own: false,
      },
      {
        id: 2,
        author: 'Tú',
        role: 'Estudiante',
        sentAt: '2026-04-11T14:10:00',
        text: 'Listo, subí la versión revisada en la carpeta de documentos y dejé la nota técnica adjunta.',
        own: true,
      },
      {
        id: 3,
        author: 'Dra. María López',
        role: 'Directora',
        sentAt: '2026-04-12T09:05:00',
        text: 'Perfecto. Continuemos con la sección de pruebas para el próximo avance.',
        own: false,
      },
    ];
  }

  private queueReply(userText: string): void {
    if (this.replyTimerId !== null) {
      window.clearTimeout(this.replyTimerId);
    }

    this.advisorTyping = true;

    this.replyTimerId = window.setTimeout(() => {
      this.messages.push({
        id: this.nextId++,
        author: this.contactName(),
        role: this.contactRole(),
        sentAt: new Date().toISOString(),
        text: this.buildReply(userText),
        own: false,
      });
      this.advisorTyping = false;
      this.replyTimerId = null;
    }, 1200);
  }

  private buildReply(userText: string): string {
    const normalized = userText.toLowerCase();
    const role = this.role();

    if (normalized.includes('hola') || normalized.includes('buen')) {
      return role === 'professor'
        ? 'Hola. Ya revisé el último avance; compartan por favor la siguiente versión consolidada y seguimos por aquí.'
        : 'Hola. Quedo atento a la siguiente versión del documento para continuar con la revisión.';
    }

    if (normalized.includes('documento') || normalized.includes('archivo') || normalized.includes('sub')) {
      return role === 'professor'
        ? 'Perfecto, en cuanto el archivo quede actualizado dejamos las observaciones finales por este chat.'
        : 'Perfecto, recibo el documento. En cuanto termine la revisión les dejo observaciones puntuales por este chat.';
    }

    if (normalized.includes('reunion') || normalized.includes('hora') || normalized.includes('mañana')) {
      return 'Podemos coordinarlo en la próxima reunión. Mientras tanto, dejen por favor los puntos clave en este chat.';
    }

    return `Recibido. Seguimos el avance de ${this.projectName.toLowerCase()} por este mismo chat.`;
  }

  private dayKey(dateValue: string): string {
    return new Date(dateValue).toDateString();
  }
}
