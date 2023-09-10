import * as React from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import {createData, getAllData, getData, updateData} from './src/firebase';
import AutoKeyboardAvoidingView from './src/AutoKeyboardAvoidingView';

const screen = Dimensions.get('screen');

const convertToVietnameDateTime = date => {
  const d = new Date(date);
  return `${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

export default function App() {
  const [data, setData] = React.useState(null);
  const [isShowModal, setIsShowModal] = React.useState(false);
  const [currentCode, setCurrentCode] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState(false);
  const [note, setNote] = React.useState('');

  const createDB = () => {
    createData({
      deviceId: '123',
      billCode: '123',
      billStatus: true,
      testResult: true,
      testDate: new Date().getTime(),
    })
      .then(() => {
        console.log('success');
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getDB = () => {
    getAllData()
      .then(data => {
        setData(data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const qrCodeScanResult = event => {
    if (isShowModal) {
      return;
    }

    if (!!event.nativeEvent.codeStringValue) {
      setIsShowModal(true);
      setCurrentCode(event.nativeEvent.codeStringValue);
    }
  };

  const changeTestResult = () => {
    setTestResult(!testResult);
  };

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const onPressSubmit = () => {
    if (!currentCode) {
      return;
    }

    setLoadingSubmit(true);
    updateData(currentCode, {
      testResult,
      testDate: new Date().getTime(),
      note,
    })
      .then(() => {
        ToastAndroid.show('Cập nhật thành công', ToastAndroid.SHORT);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoadingSubmit(false);
        setIsShowModal(false);
      });
  };

  React.useEffect(() => {
    if (currentCode) {
      setLoading(true);
      getData(currentCode)
        .then(dt => {
          setData(dt);
          setTestResult(dt?.testResult);
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentCode]);

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
      <Modal transparent visible={isShowModal}>
        <AutoKeyboardAvoidingView>
          <Pressable
            onPress={() => {
              setIsShowModal(false);
            }}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Pressable
              style={{
                width: '80%',
                height: screen.height / 2,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 10,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: 10,
                }}>
                Thông Tin Phiếu
              </Text>
              {loading ? (
                <ActivityIndicator size="large" color="red" />
              ) : data ? (
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingVertical: 5,
                    }}>
                    Id thiết bị: {data?.deviceId}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingVertical: 5,
                    }}>
                    Mã phiếu: {data?.billCode}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingVertical: 5,
                    }}>
                    Trạng thái phiếu: {data?.billStatus?.toString()}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        paddingVertical: 5,
                      }}>
                      Kết quả test:{' '}
                      {testResult ? (
                        <Text style={{color: 'green'}}>Tốt</Text>
                      ) : (
                        <Text style={{color: 'red'}}>Xấu</Text>
                      )}
                    </Text>
                    <Switch value={testResult} onChange={changeTestResult} />
                  </View>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingVertical: 5,
                    }}>
                    Ngày test:{' '}
                    {new Date(Date.now()).toLocaleTimeString('vi-VN')} -{' '}
                    {new Date(Date.now()).toLocaleDateString('vi-VN')}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                    }}>
                    {!testResult && (
                      <TextInput
                        placeholder="Ghi chú"
                        value={note}
                        multiline
                        onChangeText={setNote}
                        style={{
                          borderWidth: 1,
                          borderColor: 'gray',
                          borderRadius: 5,
                          padding: 5,
                          marginTop: 10,
                          maxHeight: 100,
                        }}
                      />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={onPressSubmit}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 5,
                      backgroundColor: 'blue',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 20,
                      }}>
                      Xác nhận
                    </Text>
                    {loadingSubmit && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'blue',
                          },
                        ]}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.barcodeTextURL}>
                    Id thiết bị: {currentCode}
                  </Text>
                  <Text style={styles.barcodeTextURL}>
                    Không tìm thấy dữ liệu
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsShowModal(false);
                    }}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 5,
                      backgroundColor: 'blue',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 20,
                      }}>
                      Quét lại
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>
          </Pressable>
        </AutoKeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
});
