//
// Created by Vietdev Studio on 18/07/2023.
//

import Foundation
import AVFoundation

class Recorder {
    var audioRecorder: AVAudioRecorder?
    var recordingSession: AVAudioSession?
    var isRecording: Bool = false

    func checkPermission() -> Bool {
        recordingSession = AVAudioSession.sharedInstance()
        let permissionStatus = recordingSession?.recordPermission
        return permissionStatus == .granted
    }

    func requestPermission(completion: @escaping (Bool) -> Void) {
        recordingSession = AVAudioSession.sharedInstance()
        recordingSession?.requestRecordPermission { [weak self] allowed in
            DispatchQueue.main.async {
                completion(allowed)
            }
        }
    }

    func startAudioRecording()-> Status {

        if (isRecording) {
            return Status(status: false, message: "Recording")
        }

        //format time: MMddyyy_HHmmss
        let currentDate = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMddyyyy_HHmmss"

        let timeStampHHmmss = dateFormatter.string(from: currentDate)
        let audioFilename = getDocumentsDirectory().appendingPathComponent("recording-\(timeStampHHmmss).m4a")

        let settings = [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 2,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder?.record()
            isRecording = true
            return Status(status: true, message: "Recording")
        } catch {
            // Xử lý lỗi khi bắt đầu ghi âm
            return Status(status: false, message: "Error when start recording")
        }
    }

    func stopRecording() {
        if (!isRecording) {
            return
        }
        isRecording = false
        audioRecorder?.stop()
        audioRecorder = nil
    }

    func getDocumentsDirectory() -> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        let documentsDirectory = paths[0]
        return documentsDirectory
    }


}
