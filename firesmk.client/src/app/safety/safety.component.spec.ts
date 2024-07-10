import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyComponent } from './safety.component';

describe('SafetyComponent', () => {
  let component: SafetyComponent;
  let fixture: ComponentFixture<SafetyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SafetyComponent]
    });
    fixture = TestBed.createComponent(SafetyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
