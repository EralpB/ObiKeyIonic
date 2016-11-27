import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Howtouse page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-howtouse',
  templateUrl: 'howtouse.html'
})
export class HowtousePage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello HowtousePage Page');
  }

}
