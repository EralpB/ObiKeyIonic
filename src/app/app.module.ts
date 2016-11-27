import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { PermissionPage } from '../pages/permission/permission';
import { ProfilePage } from '../pages/profile/profile';
import { ProfilelistPage } from '../pages/profilelist/profilelist';
import { Profilelocker } from '../providers/profilelocker';
import { HowtousePage } from '../pages/howtouse/howtouse';
import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PermissionPage,
    ProfilePage,
    ProfilelistPage,
    HowtousePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PermissionPage,
    ProfilePage,
    ProfilelistPage,
    HowtousePage
  ],
  providers: [Storage, Profilelocker, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
