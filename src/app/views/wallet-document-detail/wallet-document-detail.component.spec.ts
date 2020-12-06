import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDocumentDetailComponent } from './wallet-document-detail.component';

describe('WalletDocumentDetailComponent', () => {
  let component: WalletDocumentDetailComponent;
  let fixture: ComponentFixture<WalletDocumentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletDocumentDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletDocumentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
