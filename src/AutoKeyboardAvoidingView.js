import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';

const AutoKeyboardAvoidingView = ({children}) => {
  if (Platform.OS === 'android') {
    return children;
  } else {
    return (
      <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
        {children}
      </KeyboardAvoidingView>
    );
  }
};

export default AutoKeyboardAvoidingView;
