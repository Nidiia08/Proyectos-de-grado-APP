import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProyectosComponent } from './proyectos/proyectos.component';
import { PlantillasComponent } from './plantillas/plantillas.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { RevisionesComponent } from './revisiones/revisiones.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'plantillas', component: PlantillasComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'revisiones', component: RevisionesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuradoRoutingModule {}
