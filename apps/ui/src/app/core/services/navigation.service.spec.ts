import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavigationService } from './navigation.service';
import { NavigationEnd } from '@angular/router';
import { of } from 'rxjs';

describe('NavigationService', () => {
  let service: NavigationService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl'], {
      url: '/test',
      routerState: { root: {} }
    });
    const locationSpy = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    });

    service = TestBed.inject(NavigationService);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockLocation = TestBed.inject(Location) as jasmine.SpyObj<Location>;

    // Mock router events
    mockRouter.events = of(new NavigationEnd(1, '/test', '/test'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('navigateBackOr', () => {
    it('should call location.back() when canGoBack() returns true', () => {
      spyOn(service, 'canGoBack').and.returnValue(true);
      
      service.navigateBackOr('/fallback');
      
      expect(mockLocation.back).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to fallback when canGoBack() returns false', () => {
      spyOn(service, 'canGoBack').and.returnValue(false);
      
      service.navigateBackOr('/fallback');
      
      expect(mockLocation.back).not.toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith('/fallback');
    });

    it('should use default fallback when none provided', () => {
      spyOn(service, 'canGoBack').and.returnValue(false);
      
      service.navigateBackOr();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('canGoBack', () => {
    it('should return true when navigation history has more than one entry', () => {
      // Simulate having navigation history
      (service as any).navigationHistory = ['/page1', '/page2'];
      
      expect(service.canGoBack()).toBe(true);
    });

    it('should return false when navigation history has one or no entries', () => {
      // Simulate having no navigation history
      (service as any).navigationHistory = ['/page1'];
      
      expect(service.canGoBack()).toBe(false);
    });
  });

  describe('navigateWithQueryParams', () => {
    it('should navigate with query parameters', () => {
      service.navigateWithQueryParams('/test', { page: 1, limit: 10 });
      
      expect(mockRouter.navigate).toHaveBeenCalledWith('/test', { queryParams: { page: 1, limit: 10 } });
    });
  });

  describe('navigateWithFragment', () => {
    it('should navigate with fragment', () => {
      service.navigateWithFragment('/test', 'section1');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith('/test', { fragment: 'section1' });
    });
  });

  describe('navigateWithParamsAndFragment', () => {
    it('should navigate with both query params and fragment', () => {
      service.navigateWithParamsAndFragment('/test', { page: 1 }, 'section1');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith('/test', { 
        queryParams: { page: 1 }, 
        fragment: 'section1' 
      });
    });
  });

  describe('getCurrentUrl', () => {
    it('should return current URL without query params', () => {
      mockRouter.url = '/test?page=1&limit=10';
      
      expect(service.getCurrentUrl()).toBe('/test');
    });
  });

  describe('updateQueryParams', () => {
    it('should update query params without navigation', () => {
      service.updateQueryParams({ page: 2 });
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockRouter.routerState.root,
        queryParams: { page: 2 },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  });

  describe('updateFragment', () => {
    it('should update fragment without navigation', () => {
      service.updateFragment('section2');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockRouter.routerState.root,
        fragment: 'section2',
        replaceUrl: true
      });
    });
  });
});
