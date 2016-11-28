import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Profilelocker } from '../../providers/profilelocker';

/*
  Generated class for the Permission page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-permission',
  templateUrl: 'permission.html'
})
export class PermissionPage {
  domain_identities : any;
	filtered_permissions : any;
	permissions : any;
	allowed_permissions : any;
  identities : any;
  identity : any;
  title : any;

  token_verified : boolean;
  token_issuer : any;
  token_verified_email : boolean;


  generateRandom :boolean;
  identityId : any;

  previousIdentityId : any;
  newOne :boolean;

  constructor(private locker : Profilelocker, 
    public navCtrl: NavController,
    private viewCtrl: ViewController,
    public params : NavParams,
    private alertCtrl : AlertController) {

  	this.allowed_permissions = ["email", "password"];
  	this.filtered_permissions = [];

    var token_info = params.get('token_info');
    this.token_verified = false;
    this.token_issuer = false;
    this.token_verified_email = false;
    if(token_info){
      this.token_verification(token_info);
    }

  	this.permissions = params.get('permissions') || [];
    this.title = params.get('title');

    this.generateRandom = false;
    this.domain_identities = this.locker.getIdentitiesForDomain(this.title);
    console.log(this.domain_identities);
    if(this.domain_identities.length == 0){
      this.newOne = true;
    }else{
      this.previousIdentityId = this.domain_identities[0]['id'];
      this.newOne = false;
    }

    this.identities = locker.getIdentities();
    console.log(this.identities);
    if(this.identities.length > 0){
      this.identityId = this.identities[0].id;
    }
  	for(var i=0;i<this.permissions.length;i++){
  		if(this.allowed_permissions.indexOf(this.permissions[i]) > -1){
  			var perm = {name:this.permissions[i], checked: true};
  			this.filtered_permissions.push(perm);
  		}
  	}
  	console.log(this.filtered_permissions);
  }

  token_verification(token_info){
    if(!('aud' in token_info)){
      this.token_verified = false;
      return;
    }
    if(token_info['aud'] != "838315545909-90odb5sik65nf6qmd5t0hm0flonrvqa9.apps.googleusercontent.com"){
      this.token_verified = false;
      return;
    }
    this.token_verified = true;
    if('email' in token_info){
      this.token_issuer = token_info['email']
    }
    if('email_verified' in token_info){
      this.token_verified_email = true;
    }
  }

  approve(){
    console.log("approve clicked");
    if(!this.identityId && !this.generateRandom){
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: "You must either generate a random identity or specify one",
        buttons: [{text:'Dismiss', handler: () => { }}]
      });
      alert.present();
      return;
    }

    var identity;
  	var dict = {approved: true};
    dict['generateRandom'] = this.generateRandom;
    if(!this.generateRandom){
      console.log("not generate random");
      identity = this.locker.getIdentityWithId(this.identityId);
      if(!identity){
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: "There was a problem with the identity you selected, please try again.",
          buttons: [{text:'Dismiss', handler: () => { }}]
        });
        alert.present();
        return;
      }
    }else{
      console.log("generate random");
      identity = this.locker.generateRandomIdentityWithPrefix(this.title);
    }
    dict['identity'] = identity;

  	dict['approved_permissions'] = [];
  	for(var i =0;i<this.filtered_permissions.length;i++){
  		if(this.filtered_permissions[i].checked){
  			dict['approved_permissions'].push(this.filtered_permissions[i]['name']);
  		}
  	}
    console.log("identity:");
    console.log(identity);
    console.log(identity['usedWith']);
    identity['usedWith'][this.title] = true;
    this.locker.saveIdentity(identity);
  	console.log("dismissing with:");
  	console.log(dict);
  	this.viewCtrl.dismiss(dict);
  }

  cancel(){
  	this.viewCtrl.dismiss({approved: false});
  }

  checkedPermissionCount(){
    if(!this.filtered_permissions){return 0;}
    var count = 0;
    for(var i =0;i<this.filtered_permissions.length;i++){
      if(this.filtered_permissions[i].checked){
        count++;
      }
    }
    return count;
  }

  ionViewDidLoad() {
    console.log('Hello PermissionPage Page');
  }

  
}
