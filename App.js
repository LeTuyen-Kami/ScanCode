import * as React from 'react';
import {useState} from 'react';

import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import RNRecordModule from './src/modules/RNRecord';
import {Camera} from 'react-native-camera-kit';

export default function App() {
  const [startRecord, setStartRecord] = useState(false);
  const delayTime = React.useRef(Date.now());

  React.useEffect(() => {
    (async () => {
      const permission = await RNRecordModule.checkPermission();
      if (!permission) {
        RNRecordModule.requestPermission();
      }
    })();
  }, []);

  const toggle = async () => {
    let status = '';
    if (startRecord) {
      status = await RNRecordModule.stopRecording();
    } else {
      status = await RNRecordModule.startRecording();
    }
    setStartRecord(!startRecord);
  };

  const getListRecording = async () => {
    const list = await RNRecordModule.getListRecordings();
    console.log('list', list);
  };

  // return (
  //   <View>
  //     <Text>jahaha</Text>
  //     <Button
  //       title={'click'}
  //       onPress={() => {
  //         console.log('click', RNRecordModule);
  //       }}
  //     />
  //     <Button
  //       title={'open tree'}
  //       onPress={() => {
  //         RNRecordModule.exportRecordings([]);
  //       }}></Button>
  //     <Button
  //       title={'request permission'}
  //       onPress={() => {
  //         RNRecordModule.requestPermission();
  //       }}></Button>
  //     <Button title={'get list recording'} onPress={getListRecording}></Button>
  //     <View>
  //       <Text></Text>
  //       <Button title={startRecord ? 'stop' : 'start'} onPress={toggle} />
  //     </View>
  //     <Button
  //       title={'remove recording'}
  //       onPress={() => {
  //         RNRecordModule.removeAllRecordings();
  //       }}></Button>
  //     <Button
  //       title={'pickAudioDocuments'}
  //       onPress={async () => {
  //         const value = await RNRecordModule.pickAudioDocuments();
  //         console.log('value', value);
  //       }}></Button>
  //   </View>
  // );

  const qrCodeScanResult = event => {
    if (Date.now() - delayTime.current < 3000) {
      return;
    }
    delayTime.current = Date.now();

    Alert.alert('QR code', event.nativeEvent.codeStringValue);
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <Camera
        style={{
          flex: 1,
        }}
        // Barcode props
        scanBarcode={true}
        onReadCode={qrCodeScanResult} // optional
        showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
        laserColor="red" // (default red) optional, color of laser in scanner frame
        frameColor="white" // (default white) optional, color of border of scanner frame
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'red',
  },
});
