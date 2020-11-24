import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalityDetailComponent } from './nationality-detail.component';

describe('NationalityDetailComponent', () => {
  let component: NationalityDetailComponent;
  let fixture: ComponentFixture<NationalityDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NationalityDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NationalityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
