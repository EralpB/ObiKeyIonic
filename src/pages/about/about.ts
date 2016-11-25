import { Component } from '@angular/core';
import { BarcodeScanner } from 'ionic-native';
import { NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import {Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';
import { PermissionPage } from '../permission/permission';
import { ProfilelistPage } from '../profilelist/profilelist';
import 'rxjs/add/operator/map';
import * as aesjs from 'aes-js';
import * as jssha from 'jssha';
import { Storage } from '@ionic/storage';
import { Profilelocker } from '../../providers/profilelocker';
import {Keyboard} from 'ionic-native';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})

export class AboutPage {
  ip : any;

  myLoading : any;

  decoded : any;
  readyToDecode : any;

  presentLoading() {
  this.myLoading = this.loadingCtrl.create({
    content: 'Please wait...'
  });

  this.myLoading.present();
}

handleURL(url, page){
  console.log(this);
  console.log(page);

  var index = url.indexOf('data?d=');
  var data = url.substring(index+'data?d='.length);
  var data_json = JSON.parse(decodeURIComponent(data));
  
  console.log(data_json);
  console.log("url handle inside about");
  var func = function(data_json){
    console.log("func called");
    console.log(page);
    console.log(page.locker);
    if(page.locker.readyToDecode && (page.locker.decoded || page.locker.passwordProtected)){

      if(!page.locker.decoded){
        console.log("warning locked");
        page.warningWithMessage("You must first unlock your key");
        return;
      }else{
        console.log("handleurl completed");
        page.incomingRequestJSON(data_json);
        return;
      }
    }
    console.log("waiting on locker");
    setTimeout(function(){
      func(data_json);
    },10);

  }

  console.log("calling func");
  func(data_json);

  
  
}

dismissLoading(){
	if(this.myLoading){
		this.myLoading.dismiss();
	}
}

  constructor(private locker : Profilelocker, private alertCtrl: AlertController, private http: Http, public navCtrl: NavController, private modalCtrl : ModalController, public loadingCtrl: LoadingController) {
  	this.ip = "52.59.25.79:80";
  	this.decoded = false;
  	this.readyToDecode = false;


  }

  ionViewDidLoad(){
    var page = this;
    (<any>window).handleURL = function(url){
      page.handleURL(url, page);
    }
    var page = this;
    setTimeout(function(){
      page.presentLoading();

      var func = function(){
      if(page.locker.readyToDecode && (page.locker.decoded || page.locker.passwordProtected)){
        console.log("ready to decode");
        page.readyToDecode = true;

        page.decoded = page.locker.decoded;
        console.log(page.decoded);
        page.dismissLoading();
      }else{
        setTimeout(function(){
          func();
        }, 50);
      }
    }

    func();

    },0);

  }


  profile(){
  	this.navCtrl.push(ProfilelistPage);
  }

  unlock(){
    console.log(this.decoded);
  		var page = this;
	let alert = this.alertCtrl.create({
    title: 'Unlock',
    message: 'You must provide the password everytime you launch the app.',
    inputs: [
      {
        name: 'password',
        placeholder: 'Password (>6 char)',
        type: 'password'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          Keyboard.close()
        }
      },
      {
        text: 'Unlock',
        handler: data => {
          Keyboard.close();
          if(data.password.length < 6){
          	page.warningWithMessage("Please use a password with at least 6 characters.");
     
          	return;
          }

          page.decode(data.password);

        }
      }
    ]
  });
  alert.present();
  }

  warningWithMessage(str){
  	let alert = this.alertCtrl.create({
		    title: 'Warning',
		    subTitle: str,
		    buttons: ['Dismiss']
		  });
		  alert.present();
  }

  decode(given_password){
    var page = this;
    this.locker.decode(given_password).then(function(){
        page.decoded = true;
        console.log("success");
    }).catch(err => {
      if(given_password){
        page.alertWrongPassword();
      }
      console.log(err);
    });
  }

  alertWrongPassword(){
  	
  	let alert = this.alertCtrl.create({
		    title: 'Error',
		    subTitle: "Given password doesn\'t match the encrypted password, please try again.",
		    buttons: ['Dismiss']
		  });
		  alert.present();
  }

  

  scan(){
  	var page = this;
  	BarcodeScanner.scan().then((barcodeData) => {

	 	var qr_data = JSON.parse(barcodeData["text"]);
	 	console.log(qr_data);
	 	page.incomingRequestJSON(qr_data);

	}, (err) => {

		let alert = page.alertCtrl.create({
		    title: 'Error',
		    subTitle: 'There was an error with QR reading, please try again.',
		    buttons: ['Dismiss']
		  });
		  alert.present();
	});
  }

  incomingRequestJSON(qr_data){
    var page = this;
    let permModal = page.modalCtrl.create(PermissionPage, {title:qr_data['title'], permissions:qr_data["permissions"]});
    permModal.onDidDismiss(data => {
       if(data["approved"]){
        page.submitData(qr_data['listenId'], qr_data['key'], data["approved_permissions"], data['identity']);
       }
     });
      permModal.present();
  }


removePassword(){
	var page = this;
	let alert = this.alertCtrl.create({
    title: 'Remove Password',
    message: 'Are you sure you want to REMOVE your password protection?',
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
          page.removePasswordAction();

        }
      }
    ]
  });
  alert.present();
}
addrandom(){
  this.locker.generateRandomIdentity();
}
removePasswordAction(){
  this.locker.removePassword();
	let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: "You successfuly removed your password.",
        buttons: ['Dismiss']
      });
      alert.present();
}

setPassword(){
	var page = this;
	let alert = this.alertCtrl.create({
    title: 'Set Password',
    message: 'You must provide the password everytime you launch the app.',
    inputs: [
      {
        name: 'password',
        placeholder: 'Password (>6 char)',
        type: 'password'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
        }
      },
      {
        text: 'Set',
        handler: data => {
          if(data.password.length < 6){
          	page.warningWithMessage("Please use a password with at least 6 characters.");
          	return;
          }
          page.encryptWithPassword(data.password);

        }
      }
    ]
  });
  alert.present();
}

encryptWithPassword(password){
  this.locker.encryptWithPassword(password);
	let alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: "You successfuly encrypted your info, PLEASE don't forget your password.",
        buttons: ['Dismiss']
      });
      alert.present();
}

  submitData(listenId, qr_key, approved_permissions, identity){
  	this.presentLoading();
  	var page = this;

   	var myjson = {};
   	if(approved_permissions.indexOf('email') > -1){
   		myjson['email'] = identity.email;
   	}
   	if(approved_permissions.indexOf('password') > -1){
   		myjson['password'] = identity.password;
   	}
    console.log("myjson:"+JSON.stringify(myjson));

   	var key = new Uint8Array(32);
   	for(var i =0;i<32;i++){
   		key[i] = qr_key[i];
   	}

	let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({enc: this.locker.encodeStringWithkey(JSON.stringify(myjson),key)});
    console.log("launching post..");
    this.http.post("http://"+this.ip+"/listen/"+listenId, body, options).subscribe(data => {
        console.log("post success");
        console.log(data);
        page.dismissLoading();
        let alert = page.alertCtrl.create({
		    title: 'Success',
		    subTitle: 'You are successfuly authorized with the webpage.',
		    buttons: ['Dismiss']
		  });
		  alert.present();
    },
    err => {
    	page.dismissLoading();

    	let alert = page.alertCtrl.create({
		    title: 'Error',
		    subTitle: 'There was an error with authorizing, please try again.',
		    buttons: ['Dismiss']
		  });
		  alert.present();
    	console.log(err);
        console.log("Oops!");
    });
  }






}
