//
// Created by Vietdev Studio on 18/07/2023.
//

import Foundation
import UIKit

struct Status: Codable {
    var status: Bool
    var message: String
}

struct PickFileData: Codable {
    var uri: String
    var name: String
    var size: Int
}



@objc(RNRecordModule)
class RNRecordModule: NSObject {

    var documentPicker: DocumentPickerManager = DocumentPickerManager()

    @objc
    func checkPermission(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(Recorder().checkPermission())
    }

    @objc
    func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
      Recorder().requestPermission(completion: { allowed in
            resolve(allowed)
        })
    }

    @objc
    func startRecording(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let status = Recorder().startAudioRecording()
        resolve(Utils.structToJson(structObject: status))
    }

    @objc
    func stopRecording(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        Recorder().stopRecording()
        resolve(Utils.structToJson(structObject: Status(status: true, message: "Stop recording")))
    }

    @objc
    func getListRecordings(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let fileManager = FileManager.default
        let documentsUrl =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        do {
            let directoryContents = try fileManager.contentsOfDirectory(at: documentsUrl, includingPropertiesForKeys: nil)
            let recordings = directoryContents.filter{ $0.pathExtension == "m4a" }
            let recordingsName = recordings.map{ $0.deletingPathExtension().lastPathComponent }
            resolve(Utils.jsonArray(array: recordingsName))
        } catch {
            print(error)
            resolve(Utils.jsonArray(array: Array<String>()))
        }
    }

    @objc
    func exportRecordings(_ names: [String], resolve:@escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
        let documentsUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let fileManager = FileManager.default
        
        do {
          let directoryContents = try fileManager.contentsOfDirectory(at: documentsUrl, includingPropertiesForKeys: nil)
          let m4aFiles = directoryContents.filter { it in
              if it.pathExtension != "m4a" {
                return false
              }
              if !names.isEmpty && !names.contains(it.deletingPathExtension().lastPathComponent) {
                return false
              }
              return true

          }
          
          guard !m4aFiles.isEmpty else {
            print("Không có tệp M4A để chuyển.")
            return resolve(Utils.structToJson(structObject: Status(status: false, message: "Không có tệp M4A để chuyển.")))
          }
          
          var fileURLsToImport: [URL] = []
          for fileURL in m4aFiles {
            let fileName = fileURL.lastPathComponent
            let destinationURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)
            if fileManager.fileExists(atPath: destinationURL.path) {
              try fileManager.removeItem(at: destinationURL)
            }
            try fileManager.moveItem(at: fileURL, to: destinationURL)
            fileURLsToImport.append(destinationURL)
          }
          
          if #available(iOS 14.0, *) {
            let documentPicker = UIDocumentPickerViewController(forExporting: fileURLsToImport)
            documentPicker.shouldShowFileExtensions = true
            UIApplication.shared.keyWindow?.rootViewController?.present(documentPicker, animated: true, completion: nil)
            resolve(Utils.structToJson(structObject: Status(status: true, message: "Chuyển tệp thành công")))
          } else {
            // Fallback on earlier versions
            resolve(Utils.structToJson(structObject: Status(status: false, message: "Chuyển tệp thất bại")))
          }
        } catch {
          print("Lỗi khi chuyển tệp: \(error.localizedDescription)")
          resolve(Utils.structToJson(structObject: Status(status: false, message: "Lỗi khi chuyển tệp")))
        }
      }
    }

    @objc
    func removeAllRecordings(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let fileManager = FileManager.default
        let documentsUrl =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        do {
            let directoryContents = try fileManager.contentsOfDirectory(at: documentsUrl, includingPropertiesForKeys: nil)
            let recordings = directoryContents.filter{ $0.pathExtension == "m4a" }
            for recording in recordings {
                try fileManager.removeItem(at: recording)
            }
            resolve(Utils.structToJson(structObject: Status(status: true, message: "Remove all recordings")))
        } catch {
            print(error)
            resolve(Utils.structToJson(structObject: Status(status: false, message: "Error when remove all recordings")))
        }
    }

    @objc
    func pickAudioDocuments(_ resolve: @escaping RCTPromiseResolveBlock, reject:  RCTPromiseRejectBlock) {
        documentPicker.pickAudioDocuments { [self] url in
            resolve(Utils.structToJson(structObject: getInfoByUrl(url ?? URL(fileURLWithPath: ""))))
        }
    }

    private func getInfoByUrl(_ url: URL) -> PickFileData {
        let fileManager = FileManager.default
        let fileName = url.lastPathComponent
        let fileUri = url.absoluteString
        guard let fileSize = try? fileManager.attributesOfItem(atPath: url.path)[FileAttributeKey.size] else {
            return PickFileData(uri: fileUri, name: fileName, size: 0)
        }
        return PickFileData(uri: fileUri, name: fileName, size: fileSize as! Int)
    }


    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
