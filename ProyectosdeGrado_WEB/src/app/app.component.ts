import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth.service';
import { SidebarComponent } from './features/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly auth = inject(AuthService);
  readonly showSidebar = signal(false);

  constructor() {
    this.actualizarShell(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.actualizarShell(event.urlAfterRedirects));
  }

  private actualizarShell(url: string): void {
    const isPublicShell = url.startsWith('/login') || url.startsWith('/cambiar-password');
    this.showSidebar.set(this.auth.estaAutenticado && !isPublicShell);
  }
}
