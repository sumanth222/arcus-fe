import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcusWarmupComponent } from './arcus-warmup-component';

describe('ArcusWarmupComponent', () => {
  let component: ArcusWarmupComponent;
  let fixture: ComponentFixture<ArcusWarmupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcusWarmupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcusWarmupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
