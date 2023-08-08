package com.qrcode

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class DocumentPicker(private val activity: Activity) {
    private val REQUEST_CODE_PICK_AUDIO = 1
    private var callback: ((String) -> Unit)? = null


    fun pickAudio(callback: (String) -> Unit) {
        this.callback = callback

        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "audio/*"
        }
        activity.startActivityForResult(intent, REQUEST_CODE_PICK_AUDIO)
    }

    fun onActivityResult(data: Intent?) {
            callback?.invoke(data?.data.toString())
    }
}
