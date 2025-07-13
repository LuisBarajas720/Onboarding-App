import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingManagementComponent } from './onboarding-management.component';

describe('OnboardingManagementComponent', () => {
  let component: OnboardingManagementComponent;
  let fixture: ComponentFixture<OnboardingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
