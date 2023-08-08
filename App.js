import * as React from 'react';

import {Alert, StyleSheet, View} from 'react-native';
import {Camera} from 'react-native-camera-kit';

export default function App() {
  const delayTime = React.useRef(Date.now());

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
