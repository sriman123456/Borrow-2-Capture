import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class CameraRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      cameraName:"",
      reasonToRequest:"",
      IsCameraRequestActive : "",
      requestedCameraName: "",
      cameraStatus:"",
      requestId:"",
      userDocId: '',
      docId :''
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



  addRequest = async (cameraName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_cameras').add({
        "user_id": userId,
        "camera_name":cameraName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "camera_status" : "requested",
         "date"       : firebase.firestore.FieldValue.serverTimestamp()

    })

    await  this.getCameraRequest()

    /*  
      db.collection('users').where("email_id","==",userId).get()
      .then()
      .then((snapshot)=>{ snapshot.forEach((doc)=>{
            IsCameraRequestActive: true
          })
        })
      })
    */

    /*  
      db.collection('users').where(
      .then((snapshot)=>{ snapshot.forEach((doc)=>{
          db.collection('users').doc(doc.id).update({
            IsCameraRequestActive: true
          })
        })
      })
    */

    /*  
      db.collection('users').where("email_id","==",userId).get()
      .then()
      .then(db.collection('users').doc(doc.id).update({
            IsCameraRequestActive: true
          })
      )})
    */
    
    /*  
      db.collection('users').where("email_id","==",userId).get()
      .then()
      .then((snapshot)=>{ snapshot.forEach((doc)=>{
          db.collection('users').doc(doc.id).update({
            IsCameraRequestActive: true
          })
        })
      })
    */

    this.setState({
        cameraName :'',
        reasonToRequest : '',
        requestId: randomRequestId
    })

    return Alert.alert("Camera Requested Successfully")


  }

receivedCameras=(cameraName)=>{
  var userId = this.state.userId
  var requestId = this.state.requestId
  db.collection('received_cameras').add({
      "user_id": userId,
      "camera_name":cameraName,
      "request_id"  : requestId,
      "cameraStatus"  : "received",

  })
}


getIsCameraRequestActive(){
  db.collection('users')
  .where('email_id','==',this.state.userId)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        IsCameraRequestActive:doc.data().IsCameraRequestActive,
        userDocId : doc.id
      })
    })
  })
}


getCameraRequest =()=>{
  // getting the requested camera
var cameraRequest=  db.collection('requested_cameras')
  .where('user_id','==',this.state.userId)
  .get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      if(doc.data().camera_status !== "received"){
        this.setState({
          requestId : doc.data().request_id,
          requestedCameraName: doc.data().camera_name,
          cameraStatus:doc.data().camera_status,
          docId     : doc.id
        })
      }
    })
})}



sendNotification=()=>{
  //to get the first name and last name
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      var name = doc.data().first_name
      var lastName = doc.data().last_name

      // to get the lender id and camera nam
      db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          var lenderId  = doc.data().lender_id
          var cameraName =  doc.data().camera_name

          //targert user id is the lender id to send notification to the user
          db.collection('all_notifications').add({
            "targeted_user_id" : lenderId,
            "message" : name +" " + lastName + " received the camera " + cameraName ,
            "notification_status" : "unread",
            "camera_name" : cameraName
          })
        })
      })
    })
  })
}

componentDidMount(){
  this.getCameraRequest()
  this.getIsCameraRequestActive()

}

updateCameraRequestStatus=()=>{
  //updating the camera status after receiving the camera
  db.collection('requested_cameras').doc(this.state.docId)
  .update({
    camera_status : 'recieved'
  })

  //getting the  doc id to update the users doc
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc) => {
      //updating the doc
      db.collection('users').doc(doc.id).update({
        IsCameraRequestActive: false
      })
    })
  })


}


  render(){

    if(this.state.IsCameraRequestActive === true){
      return(

        // Status screen

        <View style = {{flex:1,justifyContent:'center'}}>
          <View style={{borderColor:"#6fc0b8",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text>Camera Name</Text>
          <Text>{this.state.requestedCameraName}</Text>
          </View>
          <View style={{borderColor:"#6fc0b8",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text> Camera Status </Text>

          <Text>{this.state.cameraStatus}</Text>
          </View>

          {/*
            <TouchableOpacity style={styles.button}
              onPress={()=>{
                this.sendNotification()
                this.updateCameraRequestStatus();
                this.receivedCameras(this.state.requestedCameraName)
            }}>
              <Text>I recieved the camera </Text>
            </TouchableOpacity> 
          */}
          
          {/*
            <TouchableOpacity style={styles.button}>
              <Text>I recieved the camera </Text>
            </TouchableOpacity> 
          */}

          {/*
            <TouchableOpacity style={styles.button}
              onPress={()=>{
                this.sendNotification()
                this.updateCameraRequestStatus();
                this.receivedCameras(this.state.requestedCameraName)
            }}>
            </TouchableOpacity> 
        */}

          {/*
            <TouchableOpacity style={styles.button}
              onPress=
                this.sendNotification()
                this.updateCameraRequestStatus();
                this.receivedCameras(this.state.requestedCameraName)
            >
              <Text>I recieved the camera </Text>
          </TouchableOpacity> 
        */}

        </View>
      )
    }
    else
    {
    return(
      // Form screen
        <View style={{flex:1}}>
          <MyHeader title="Request Camera" navigation ={this.props.navigation}/>

          <ScrollView>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter camera name"}
                onChangeText={(text)=>{
                    this.setState({
                        cameraName:text
                    })
                }}
                value={this.state.cameraName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the camera"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{ this.addRequest(this.state.cameraName,this.state.reasonToRequest);
                }}
                >
                <Text>Request</Text>
              </TouchableOpacity>

            </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#6fc0b8',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#6fc0b8",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
