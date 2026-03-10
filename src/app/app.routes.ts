import { Routes } from '@angular/router';
import { ArcusHomeComponent } from './arcus-home/arcus-home';
import { ArcusWarmupComponent } from './arcus-warmup-component/arcus-warmup-component';
import { WorkoutComponent } from './workout-component/workout-component';
import { RestScreenComponent } from './rest-screen-component/rest-screen-component';
import { WorkoutCompleteComponent } from './workout-complete-component/workout-complete-component';

export const routes: Routes = [
  {
    path: 'home',
    component: ArcusHomeComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'warmup',
    component: ArcusWarmupComponent
  },
  {
    path: 'workout',
    component: WorkoutComponent
  },
  {
    path: 'rest',
    component: RestScreenComponent
  },
  {
    path: 'complete',
    component: WorkoutCompleteComponent
  }
];
