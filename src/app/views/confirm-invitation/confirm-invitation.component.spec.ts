import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInvitationComponent } from './confirm-invitation.component';

describe('ConfirmInvitationComponent', () => {
  let component: ConfirmInvitationComponent;
  let fixture: ComponentFixture<ConfirmInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
