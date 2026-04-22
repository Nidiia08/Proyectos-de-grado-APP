import { Component, inject, Input } from '@angular/core';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-under-development',
  standalone: true,
  templateUrl: './under-development.component.html',
  styleUrl: './under-development.component.scss',
})
export class UnderDevelopmentComponent {
  private readonly nav = inject(NavigationService);

  @Input({ required: true }) view!: string;

  goBack(): void {
    this.nav.navigate('dashboard');
  }
}
