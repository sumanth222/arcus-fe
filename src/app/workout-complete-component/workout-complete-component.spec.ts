import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutCompleteComponent } from './workout-complete-component';

describe('WorkoutCompleteComponent', () => {
  let component: WorkoutCompleteComponent;
  let fixture: ComponentFixture<WorkoutCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
