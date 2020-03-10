import { TestBed } from '@angular/core/testing';

import { ComponentGeneratorService } from './component-generator.service';

describe('ComponentGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComponentGeneratorService = TestBed.get(ComponentGeneratorService);
    expect(service).toBeTruthy();
  });
});
