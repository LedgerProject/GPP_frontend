import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LangswitchComponent } from './langswitch.component';

describe('LangswitchComponent', () => {
  let component: LangswitchComponent;
  let fixture: ComponentFixture<LangswitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LangswitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LangswitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
