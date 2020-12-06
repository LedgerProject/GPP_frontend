import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDocumentsComponent } from './wallet-documents.component';

describe('WalletDocumentsComponent', () => {
  let component: WalletDocumentsComponent;
  let fixture: ComponentFixture<WalletDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
