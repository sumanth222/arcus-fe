import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcusHome } from './arcus-home';

describe('ArcusHome', () => {
  let component: ArcusHome;
  let fixture: ComponentFixture<ArcusHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcusHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcusHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
