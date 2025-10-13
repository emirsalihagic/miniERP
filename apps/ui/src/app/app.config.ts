import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeAuth } from './core/initializers/auth.initializer';
import { AuthService } from './core/services/auth.service';
import {
  DashboardOutline,
  FileTextOutline,
  ShoppingOutline,
  TeamOutline,
  ShopOutline,
  UserOutline,
  DollarOutline,
  ShoppingCartOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  ArrowLeftOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  EyeOutline,
  EyeInvisibleOutline,
  LockOutline,
  SettingOutline,
  LogoutOutline,
  UserAddOutline,
  AppstoreOutline,
  TagsOutline,
  ClusterOutline,
  CreditCardOutline
} from '@ant-design/icons-angular/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: NZ_ICONS,
      useValue: [
        DashboardOutline,
        FileTextOutline,
        ShoppingOutline,
        TeamOutline,
        ShopOutline,
        UserOutline,
        DollarOutline,
        ShoppingCartOutline,
        MenuFoldOutline,
        MenuUnfoldOutline,
        ArrowLeftOutline,
        PlusOutline,
        EditOutline,
        DeleteOutline,
        CheckCircleOutline,
        CloseCircleOutline,
        EyeOutline,
        EyeInvisibleOutline,
        LockOutline,
        SettingOutline,
        LogoutOutline,
        UserAddOutline,
        AppstoreOutline,
        TagsOutline,
        ClusterOutline,
        CreditCardOutline
      ]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
