import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureAddComponent } from './structure-add.component';

describe('StructureAddComponent', () => {
  let component: StructureAddComponent;
  let fixture: ComponentFixture<StructureAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
