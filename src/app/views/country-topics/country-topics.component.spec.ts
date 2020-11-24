import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryTopicsComponent } from './country-topics.component';

describe('CountryTopicsComponent', () => {
  let component: CountryTopicsComponent;
  let fixture: ComponentFixture<CountryTopicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountryTopicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
