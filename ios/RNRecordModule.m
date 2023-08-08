//
//  RecorderModule.m
//  QRCode
//
//  Created by Vietdev Studio on 18/07/2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(RNRecordModule, NSObject)
RCT_EXTERN_METHOD(startRecording:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopRecording:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(checkPermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(requestPermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getListRecordings:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(exportRecordings:(NSArray)names resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(removeAllRecordings:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pickAudioDocuments:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end

