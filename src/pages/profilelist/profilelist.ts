import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Profilelocker } from '../../providers/profilelocker';
import { ProfilePage } from '../profile/profile';
/*
  Generated class for the Profilelist page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-profilelist',
  templateUrl: 'profilelist.html'
})
export class ProfilelistPage {
  identities : any;
  constructor(private locker : Profilelocker,
  	public navCtrl: NavController,
    private alertCtrl : AlertController) {
    this.identities = [];
  }

  ionViewDidEnter() {
    console.log('Hello ProfilelistPage Page');
    this.identities = this.locker.getIdentities();
  }

  openIdentity(identity){
    this.navCtrl.push(ProfilePage, {identity:identity})
  }

  createIdentity(){
    this.navCtrl.push(ProfilePage);
  }


}
