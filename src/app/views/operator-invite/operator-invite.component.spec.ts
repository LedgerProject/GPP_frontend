import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorInviteComponent } from './operator-invite.component';

describe('OperatorInviteComponent', () => {
  let component: OperatorInviteComponent;
  let fixture: ComponentFixture<OperatorInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatorInviteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
