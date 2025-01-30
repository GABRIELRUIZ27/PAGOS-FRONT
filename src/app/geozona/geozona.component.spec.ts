import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeozonaComponent } from './geozona.component';

describe('GeozonaComponent', () => {
  let component: GeozonaComponent;
  let fixture: ComponentFixture<GeozonaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeozonaComponent]
    });
    fixture = TestBed.createComponent(GeozonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
