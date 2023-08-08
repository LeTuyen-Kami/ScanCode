import Foundation
import UIKit
import MobileCoreServices

class DocumentPickerManager: NSObject, UIDocumentPickerDelegate {
    var callback: ((URL?) -> Void)?

    func pickAudioDocuments(_ callback: @escaping (URL?) -> Void) {
        self.callback = callback

        DispatchQueue.main.async {
          let documentPicker = UIDocumentPickerViewController(documentTypes: [kUTTypeAudio as String], in: .import)
          documentPicker.delegate = self
          documentPicker.allowsMultipleSelection = false
          documentPicker.modalPresentationStyle = .formSheet
          UIApplication.shared.keyWindow?.rootViewController?.present(documentPicker, animated: true, completion: nil)
        }
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        // Xử lý danh sách URL tệp âm thanh đã chọn
        // Gọi completion handler để truyền URL về phía JavaScript
        print("didPickDocumentsAt \(urls)")
        self.callback?(urls.first)
    }

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        // Gọi completion handler với giá trị nil để xác định người dùng đã huỷ chọn tệp
        print("cancel")
        self.callback?(nil)
    }
}
