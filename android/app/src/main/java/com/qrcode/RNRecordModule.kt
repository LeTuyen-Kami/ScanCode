package com.qrcode

import android.Manifest
import android.app.Activity
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RNRecordModule(reactContext: ReactApplicationContext)  : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {
    override fun getName(): String = "RNRecordModule"

    private val RECORD_AUDIO_PERMISSION = Manifest.permission.RECORD_AUDIO
    private val REQUEST_CODE_PICK_AUDIO = 1
    private val PERMISSION_REQUEST_CODE = 200
    private var isRecording = false
    private var recorder: MediaRecorder? = null
    private var outputFile: String? = null
    private var documentPicker: DocumentPicker? = null


    init {
        reactApplicationContext?.addActivityEventListener(this)
    }

    @ReactMethod
    private fun requestPermission() {
        ActivityCompat.requestPermissions(
            this.currentActivity!!,
            arrayOf(RECORD_AUDIO_PERMISSION),
            PERMISSION_REQUEST_CODE
        )
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    private fun checkPermission():Boolean{
        val result = ContextCompat.checkSelfPermission(this.currentActivity!!, RECORD_AUDIO_PERMISSION)
        Log.d("RNRecordModule", "checkPermission: $result")
        return result == PackageManager.PERMISSION_GRANTED
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun startRecording(): String {

        if (isRecording) {
            return Status(false, "Already recording").toString()
        }

        val externalFilesDir = reactApplicationContext.getExternalFilesDir(null)
            ?: return Status(false, "No external storage found").toString()

        val recordingsDir = File(externalFilesDir.absolutePath + "/Recordings")
        if (!recordingsDir.exists()) {
            recordingsDir.mkdir()
        }

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        outputFile = "${recordingsDir.absolutePath}/recording_$timeStamp"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            recorder = MediaRecorder(reactApplicationContext).apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setOutputFile(outputFile)
                setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT)
                prepare()
                start()
            }
        } else {
            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setOutputFile(outputFile)
                setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT)
                prepare()
                start()
            }
        }

        try {
            isRecording = true
            return Status(true, "Recording started").toString()
        } catch (e: Exception) {
            Log.e("RNRecordModule", "prepare() failed")
            e.printStackTrace()
            return Status(false, "Recording failed").toString()
        }

    }

    @ReactMethod
    fun stopRecording(): String {
        if (isRecording) {
            recorder?.stop()
            recorder?.reset()
            recorder?.release()
            isRecording = false
            return Status(true, "Recording stopped").toString()
        } else {
            return Status(false, "Recording not started").toString()
        }
    }

    @ReactMethod
    fun exportRecording(): String {
        if (outputFile != null) {
            return Status(true, outputFile!!).toString()
        } else {
            return Status(false, "No recording found").toString()
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getListRecordings(): String {
        val externalFilesDir = reactApplicationContext.getExternalFilesDir(null)
            ?: return Status(false, "No external storage found").toString()

        val recordingsDir = File(externalFilesDir.absolutePath + "/Recordings")
        if (!recordingsDir.exists()) {
            recordingsDir.mkdir()
        }
        val listRecordings = recordingsDir.listFiles()
        val listRecordingsString = listRecordings?.joinToString(separator = ",") { it.name }
        return Status(true, listRecordingsString!!).toString()
    }

    @ReactMethod
    fun openExport(){
        val requestCode = 42
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
        reactApplicationContext.currentActivity?.startActivityForResult(intent, requestCode)
    }

    @ReactMethod
    fun removeAllRecordings(): String {
        val externalFilesDir = reactApplicationContext.getExternalFilesDir(null)
            ?: return Status(false, "No external storage found").toString()

        val recordingsDir = File(externalFilesDir.absolutePath + "/Recordings")
        if (!recordingsDir.exists()) {
            recordingsDir.mkdir()
        }
        val listRecordings = recordingsDir.listFiles()
        listRecordings?.forEach {
            it.delete()
        }
        return Status(true, "Remove all recordings success").toString()
    }

    private fun saveRecordingToMusicFolder(fileName: String, filePath: String) {
        val resolver = reactApplicationContext.contentResolver

        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "audio/mp4")
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MUSIC)
        }

        val collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val item = resolver.insert(collection, contentValues)

        try {
            item?.let { uri ->
                resolver.openOutputStream(uri)?.use { outputStream ->
                    File(filePath).inputStream().use { inputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }


    @ReactMethod
    fun exportRecordings(names: ReadableArray) {
        val recordingsDir = File(reactApplicationContext.getExternalFilesDir(null), "recordings")
        val recordingFiles = recordingsDir.listFiles()
        if (recordingFiles != null) {
            for (file in recordingFiles) {

                if (names.size() != 0 && !names.toArrayList().contains(file.name)) {
                    continue
                }

                // Đổi tên file ghi âm
                val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
                val fileName = "recording_$timeStamp"
                Log.d("RNRecordModule", "fileName: $fileName")
                val filePath = "${recordingsDir.absolutePath}/$fileName"
                file.renameTo(File(filePath))

                // Lưu file ghi âm vào thư mục Music
                saveRecordingToMusicFolder(fileName, filePath)
            }

        }
    }

    @ReactMethod
    fun pickAudioDocuments(promise: Promise) {
        Log.wtf("RNRecordModule", "pickAudioDocuments ${documentPicker.toString()} $currentActivity")
        currentActivity?.runOnUiThread {
            documentPicker = DocumentPicker(currentActivity!!)
            documentPicker?.pickAudio {
                if (it != null) {
                    promise.resolve(getInfoByUrl(it))
                } else {
                    promise.reject("Fail", "Pick file failed")
                }
            }
        }
    }

    private fun getInfoByUrl(uriString: String): String {
        val uri = Uri.parse(uriString)

        val contentResolver: ContentResolver = reactApplicationContext.contentResolver

        var name: String? = null
        var size: Long = 0

        // Lấy tên tệp từ Uri
        val nameCursor: Cursor? = contentResolver.query(uri, null, null, null, null)
        nameCursor?.use {
            if (it.moveToFirst()) {
                name = it.getString((it.getColumnIndex(OpenableColumns.DISPLAY_NAME) ?: "") as Int)
            }
        }

        // Lấy kích thước tệp từ Uri
        val sizeCursor: Cursor? = contentResolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)
        sizeCursor?.use {
            if (it.moveToFirst()) {
                size = it.getLong(it.getColumnIndex(OpenableColumns.SIZE) ?: 0)
            }
        }
        return PickFileData(uri, name!!, size).toString()
    }

    override fun onActivityResult(p0: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode === REQUEST_CODE_PICK_AUDIO) {
            if (resultCode === AppCompatActivity.RESULT_OK) {
                documentPicker?.onActivityResult(data)
            }
        }
    }

    override fun onNewIntent(p0: Intent?) {
    }


}

data class  Status(val status: Boolean, val message: String) {
    override fun toString(): String {
        return "{\"status\": \"$status\", \"message\": \"$message\"}"
    }
}

data class PickFileData(val uri: Uri, val name: String, val size: Long) {
    override fun toString(): String {
        return "{\"uri\": \"$uri\", \"name\": \"$name\", \"size\": $size}"
    }
}