import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterPolygonComponent } from './alter-polygon.component';

describe('AlterPolygonComponent', () => {
  let component: AlterPolygonComponent;
  let fixture: ComponentFixture<AlterPolygonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlterPolygonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterPolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
