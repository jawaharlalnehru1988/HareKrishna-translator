import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationCorrector } from './translation-corrector';

describe('TranslationCorrector', () => {
  let component: TranslationCorrector;
  let fixture: ComponentFixture<TranslationCorrector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationCorrector],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationCorrector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
