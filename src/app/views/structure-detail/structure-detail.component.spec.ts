import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureDetailComponent } from './structure-detail.component';

describe('StructureDetailComponent', () => {
  let component: StructureDetailComponent;
  let fixture: ComponentFixture<StructureDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
