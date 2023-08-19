import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultimatselectComponent } from './multimatselect.component';

describe('MultimatselectComponent', () => {
  let component: MultimatselectComponent;
  let fixture: ComponentFixture<MultimatselectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultimatselectComponent]
    });
    fixture = TestBed.createComponent(MultimatselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
