import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {Http, URLSearchParams} from '@angular/http';
import {Validators, FormBuilder } from '@angular/forms';
import {Keyboard} from 'ionic-native';
import { Profilelocker } from '../../providers/profilelocker';

/*
  Generated class for the Profile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  todo : any;
  identity : any;
  constructor(private locker : Profilelocker,
    public navCtrl: NavController,
  	public params : NavParams,
  	public formBuilder: FormBuilder,
    public alertCtrl: AlertController) {
  	this.identity = params.get('identity');
  	this.todo = this.formBuilder.group({
      title: ['', Validators.required],
      name: [''],
      email: [''],
      password: [''],
      address: [''],
    });
    if(this.identity){
      this.todo.patchValue(this.identity);
    }
  }

  ionViewDidLoad() {
    console.log('Hello ProfilePage Page');
    Keyboard.hideKeyboardAccessoryBar(false);
  	Keyboard.disableScroll(true);
  }

  deleteIdentity(){
    var page= this;
    let alert = this.alertCtrl.create({
    title: 'Delete Identity',
    message: 'Are you sure you want to DELETE your identity:'+this.identity.title,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
        }
      },
      {
        text: 'REMOVE',
        handler: data => {
            page.locker.deleteIdentityWithId(this.identity['id']);
            page.navCtrl.pop();

        }
      }
    ]
  });
  alert.present();

    
  }

  logForm(){
    var page = this;
    if(!this.todo.valid){return;}
    if(this.identity){
      var updated_identity = this.todo.value;
      updated_identity['id'] = this.identity['id'];
      this.locker.saveIdentity(updated_identity);
    }else{
      this.locker.saveIdentity(this.todo.value);
    }
    let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: "Successfuly updated identities",
        buttons: [{text:'Dismiss', handler: () => { this.navCtrl.pop();}}]
      });
      alert.present();

    
  }

}
