import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { PermissionPage } from '../pages/permission/permission';
import { ProfilePage } from '../pages/profile/profile';
import { ProfilelistPage } from '../pages/profilelist/profilelist';
import { Profilelocker } from '../providers/profilelocker';
import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PermissionPage,
    ProfilePage,
    ProfilelistPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PermissionPage,
    ProfilePage,
    ProfilelistPage
  ],
  providers: [Storage, Profilelocker, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
