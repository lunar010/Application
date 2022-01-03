import React, { useState, useEffect, Component } from 'react';
import { ImageBackground, Dimensions,Linking, ActivityIndicator, FlatList, StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { ImageManipulator } from 'expo-image-crop'

export default function App({ navigation})  {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const permisionFunction = async () => {
    const cameraPermission = await Camera.requestPermissionsAsync();

    setCameraPermission(cameraPermission.status === 'granted');

    if (
      cameraPermission.status !== 'granted'
    ) {
      alert('Permission for media access needed.');
    }
  };

  useEffect(() => {
    permisionFunction();
  }, []);

  const googleapi = async (base64: String) => {
    try {
      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=key', { method: 'POST', body: JSON.stringify({ requests: [ { image: { content: base64, }, features: [ { type: 'TEXT_DETECTION', maxResults: 5 }, { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 5 } ],},],}),});
      const json = await response.json();
      let phoneNumber = '';
      setData(json.responses[0].fullTextAnnotation.text.replace('코로나19', '').replace(/\D/g,''));
      if (Platform.OS === 'android') { phoneNumber = `tel:${json.responses[0].fullTextAnnotation.text.replace('코로나19', '').replace(/\D/g,'').replace('19', '').substr(0,10)}`; }
      else {phoneNumber = `telprompt:${json.responses[0].fullTextAnnotation.text.replace('코로나19', '').replace(/\D/g,'').replace('19', '').substr(0,10)}`; }
      Linking.openURL(phoneNumber);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      setImageUri(data.uri);
      googleapi(data.base64);
    }
  };
  
  return (
    
    <View style={styles.container}>
      
      <View style={styles.ad}>
        <Text style={styles.phone}> </Text>
        <AdMobBanner
          bannerSize="fullBanner"
          adUnitID="ca-app-pub-3662042415024095/1201278409"
          servePersonalizedAds />
      </View>
      <Camera
        ref={(ref) => setCamera(ref)}
        style={styles.fixedRatio}
        type={type}
        ratio={'1:1'}
      >
        <Text > </Text>
        <Text style={styles.main}>번호를 가까이 찍어주세요 </Text>
        <Text style={styles.main}>(인식률이 증가합니다)</Text>
        <View
            style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            }}
        >
          
        
          <TouchableOpacity
            style={{
            flex: 2,
            alignSelf: 'flex-end',
            textAlign: 'center',
            alignItems: 'center',
            backgroundColor: '#2c2c2d',
            borderColor: 'transparent',
            borderRadius: 15, 
            borderWidth: 2,
            padding: 2,
          
            margin: Platform.OS === 'ios' ? 13 : 150,
            marginBottom: 7,
            }}
            onPress={takePicture}
          >
              <Text style={{ fontSize: 20, marginBottom: 12, marginTop: 12, color: '#5281d7' }} >빠른 안심콜 걸기</Text>
          </TouchableOpacity>
        </View>

      </Camera>
      {/*{imageUri && <Image source={{ uri: imageUri }} style={{ flex: 1 }} />}*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    marginTop: Platform.OS === 'ios' ? - 16 : 6,
  },
  ad: {
    alignItems: 'center',
  },
  main: {
    textAlign: 'center',
    color: 'tomato',
    fontWeight: 'bold'
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: Platform.OS === 'ios' ? 0.62 : 0.9,
  },
  bv: {
    borderRadius: 15,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 50,
  },
  button: {
    flex: 0.1,
    padding: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
});
