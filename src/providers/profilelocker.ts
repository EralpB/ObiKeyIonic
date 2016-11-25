import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as aesjs from 'aes-js';
import * as jssha from 'jssha';
import * as chance from 'chance';
import { Storage } from '@ionic/storage';
/*
  Generated class for the Profilelocker provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Profilelocker {
	identities : any;
	identity_dictionary : any;
	passwordProtected : any;
  	decoded : any;
  	readyToDecode : any;

  	password : any;
  	myChance: any;

  constructor(private storage: Storage, private platform : Platform, public http: Http) {
  	this.identities = [];
  	this.identity_dictionary = [];
  	this.decoded = false;
  	this.password = false;
  	this.readyToDecode = false;
  	this.passwordProtected =false;
  	this.myChance = new chance();

  	var locker = this;
    console.log("locker construct");
    platform.ready().then(() => {
    	
	  	locker.storage.get('passwordProtected').then(function(passwordProtected){
	  		console.log("password protected:");
	  		console.log(passwordProtected);

	  		if(passwordProtected){
	  			locker.passwordProtected = true;
	  		}else{
	  			locker.passwordProtected = false;
	  		}
	  		locker.readyToDecode = true;
	  		if(!locker.passwordProtected){
	  			locker.decode(undefined);
	  		}
	  	});
    });

  }

  decode(given_password){
  	var locker = this;

  	return new Promise(function(resolve, reject) {


	  	if(!locker.readyToDecode){console.log("not ready");reject('not ready');return;}
	  	
	  	var key_hex = false;
	  	var key_buffer = false;
	  	if(given_password){
	  		let shaObj = new jssha("SHA-256", "TEXT");
	    	shaObj.update(given_password);
	    	key_buffer = shaObj.getHash("ARRAYBUFFER");
	    	key_hex = shaObj.getHash("HEX");
	    }

	  	locker.storage.get('password').then(function(stored_password){
	  		
	  		
	  		
	  		if(locker.passwordProtected && stored_password != key_hex){
	  			console.log("stored password:");
	  			console.log(stored_password);
	  			console.log("hex:"+key_hex);
	  			console.log("not equal");
	  			locker.decoded = false;
	  		}


	  		locker.password = given_password;

	  		return locker.storage.get('identities');
	  	}).then(function(saved_info){
	  		if(saved_info){
	  			if(locker.passwordProtected){
	  				locker.identities = JSON.parse(locker.decodeWithkey(saved_info, key_buffer));
	  			}else{
	  				locker.identities = JSON.parse(saved_info);
	  			}
	  		}
	  		console.log(locker.identities);
	  		for(var i =0;i<locker.identities.length;i++){
	  			locker.identity_dictionary[locker.identities[i]['id']] = locker.identities[i];
	  		}
	  		locker.decoded = true;

	  		console.log("decoded identities..");
	  		console.log(locker.identities);
	  		resolve(locker.identities);
	  	}).catch(function(err){
	  		locker.decoded = false;
	  		reject(err);
	  	});

  	});
  }

  encodeStringWithkey(text, key){
	var textBytes = aesjs.util.convertStringToBytes(text);
	var aesCtr = new aesjs.ModeOfOperation.ctr(key);
	var encryptedBytes = aesCtr.encrypt(textBytes);
	return encryptedBytes;
  }

  decodeWithkey(str, key){
  	var enc_bytes = aesjs.util.convertStringToBytes(str);
  	var aesCtr = new aesjs.ModeOfOperation.ctr(key);
	var decryptedBytes = aesCtr.decrypt(enc_bytes);
	var decryptedText = aesjs.util.convertBytesToString(decryptedBytes);
	return decryptedText;
  }

  removePassword(){
  	this.storage.set('passwordProtected', false);
	this.password = false;
  	this.passwordProtected = false;
  	this.save();
  }


  encryptWithPassword(password){
	let shaObj = new jssha("SHA-256", "TEXT");
    shaObj.update(password);
    let key_buffer = shaObj.getHash("ARRAYBUFFER");
    let key_hash = shaObj.getHash("HEX");
    this.storage.set('password', key_hash);
    this.storage.set('passwordProtected', true);
    this.password = password;
    this.passwordProtected = true;

    this.save();
	}

	generateRandomIdentityWithPrefix(prefix){
		var identity = {};
		identity['title'] = prefix+this.myChance.natural({min: 1, max: 9999999});
		identity['name'] = this.myChance.name();
		identity['email'] = this.myChance.email();
		identity['address'] = this.myChance.address();
		identity['password'] = this.randomPassword();
		identity['usedWith'] = {};
		return this.saveIdentity(identity);
	}

	generateRandomIdentity(){
		return this.generateRandomIdentityWithPrefix('random');
	}

	randomPassword()
    {
	    var text = "";
	    var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	    var lowercase = "abcdefghijklmnopqrstuvwxyz"
	    var numbers = "0123456789";
	    var special = "!#@$";
	    var length = 12;

	    var possible = uppercase+lowercase+numbers+special;

	    for( var i=0; i < length; i++ ){
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    if(!text.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!#@$])[0-9a-zA-Z!#@$]{8,}$/)){
	      return this.randomPassword();
	    }
	    return text;
    }

    getIdentities(){
    	return this.identities;
    }

    save(){
    	console.log("Saving identities..");
    	console.log(this.identities);
    	if(this.passwordProtected){
    		let shaObj = new jssha("SHA-256", "TEXT");
		    shaObj.update(this.password);
		    let key_buffer = shaObj.getHash("ARRAYBUFFER");
		    this.storage.set('identities', this.encodeStringWithkey(JSON.stringify(this.identities), key_buffer));
    	}else{
    		this.storage.set('identities', JSON.stringify(this.identities));
    	}
    }

    getIdentityWithId(id){
    	return this.identity_dictionary[id];
    }

    identityDictionaryToList(){
    	var locker = this;
    	console.log(this);
    	console.log("dic to list..");
    	console.log(this.identity_dictionary);
    	var keys = Object.keys(this.identity_dictionary);
    	this.identities = [];
		keys.forEach(function(key){
			locker.identities.push(locker.identity_dictionary[key]);
		});
		console.log("new identity list");
		console.log(this.identities);
    }	

    saveIdentity(identity){
    	console.log("Saving identity..")
    	console.log(identity);
    	if(!('id' in identity)){
    		
    		identity['id'] = this.myChance.string({length: 10});
    	}
    	console.log(identity);
    	if(identity['id'] in this.identity_dictionary){
    		console.log("in");
    		this.identity_dictionary[identity['id']] = identity;
    		this.identityDictionaryToList();
    	}else{
    		console.log("out");
    		this.identity_dictionary[identity['id']] = identity;
    		this.identities.push(identity);
    	}
    	this.save();
    	return identity;
    }

    getIdentitiesForDomain(title){
    	var result = [];
    	for(var i =0;i<this.identities.length;i++){
    		if(title in this.identities[i]['usedWith']){
    			result.push(this.identities[i]);
    		}
    	}
    	return result;
    }

    deleteIdentityWithId(id){
    	delete this.identity_dictionary[id];
    	this.identityDictionaryToList();
    	this.save();
    }

    


}
