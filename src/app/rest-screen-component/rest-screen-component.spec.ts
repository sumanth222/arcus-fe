import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestScreenComponent } from './rest-screen-component';

describe('RestScreenComponent', () => {
  let component: RestScreenComponent;
  let fixture: ComponentFixture<RestScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
