import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamayanaReader } from './ramayana-reader';

describe('RamayanaReader', () => {
  let component: RamayanaReader;
  let fixture: ComponentFixture<RamayanaReader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RamayanaReader],
    }).compileComponents();

    fixture = TestBed.createComponent(RamayanaReader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
