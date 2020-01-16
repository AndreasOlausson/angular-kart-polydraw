import { TestBed } from '@angular/core/testing';

import { ComponentGeneraterService } from './component-generater.service';

describe('ComponentGeneraterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComponentGeneraterService = TestBed.get(ComponentGeneraterService);
    expect(service).toBeTruthy();
  });
});
