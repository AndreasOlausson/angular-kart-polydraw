import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMarkerPopupComponent } from './info-marker.component';

describe('AlterPolygonComponent', () => {
  let component: InfoMarkerPopupComponent;
  let fixture: ComponentFixture<InfoMarkerPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoMarkerPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoMarkerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
