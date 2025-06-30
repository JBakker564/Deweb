package com.redcamera.control.camera

import android.util.Log
import com.redcamera.control.network.NetworkService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * Class that encapsulates camera command operations
 */
class CameraCommands(private val networkService: NetworkService) {
    private val TAG = "CameraCommands"
    private val scope = CoroutineScope(Dispatchers.Main)
    
    /**
     * Start recording
     */
    fun startRecording(callback: (Boolean, String) -> Unit) {
        scope.launch {
            try {
                val result = networkService.sendCommand("camera.start_recording")
                result.fold(
                    onSuccess = {
                        Log.d(TAG, "Start recording successful")
                        callback(true, "Recording started")
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Start recording failed: ${error.message}")
                        callback(false, "Failed to start recording: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Start recording exception: ${e.message}")
                callback(false, "Error: ${e.message}")
            }
        }
    }
    
    /**
     * Stop recording
     */
    fun stopRecording(callback: (Boolean, String) -> Unit) {
        scope.launch {
            try {
                val result = networkService.sendCommand("camera.stop_recording")
                result.fold(
                    onSuccess = {
                        Log.d(TAG, "Stop recording successful")
                        callback(true, "Recording stopped")
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Stop recording failed: ${error.message}")
                        callback(false, "Failed to stop recording: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Stop recording exception: ${e.message}")
                callback(false, "Error: ${e.message}")
            }
        }
    }
    
    /**
     * Set ISO value
     */
    fun setISO(isoValue: Int, callback: (Boolean, String) -> Unit) {
        scope.launch {
            try {
                val params = JSONObject().apply {
                    put("value", isoValue)
                }
                
                val result = networkService.sendCommand("camera.set_iso", params)
                result.fold(
                    onSuccess = {
                        Log.d(TAG, "Set ISO successful: $isoValue")
                        callback(true, "ISO set to $isoValue")
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Set ISO failed: ${error.message}")
                        callback(false, "Failed to set ISO: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Set ISO exception: ${e.message}")
                callback(false, "Error: ${e.message}")
            }
        }
    }
    
    /**
     * Set shutter angle
     */
    fun setShutterAngle(angle: Double, callback: (Boolean, String) -> Unit) {
        scope.launch {
            try {
                val params = JSONObject().apply {
                    put("value", angle)
                }
                
                val result = networkService.sendCommand("camera.set_shutter", params)
                result.fold(
                    onSuccess = {
                        Log.d(TAG, "Set shutter angle successful: $angle")
                        callback(true, "Shutter angle set to $angle")
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Set shutter angle failed: ${error.message}")
                        callback(false, "Failed to set shutter angle: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Set shutter angle exception: ${e.message}")
                callback(false, "Error: ${e.message}")
            }
        }
    }
    
    /**
     * Check if the camera is currently recording
     */
    suspend fun isRecording(): Result<Boolean> {
        return try {
            val result = networkService.sendCommand("camera.is_recording")
            result.fold(
                onSuccess = { response ->
                    val isRecording = response.optJSONObject("result")?.optBoolean("recording", false) ?: false
                    Log.d(TAG, "Is recording: $isRecording")
                    Result.success(isRecording)
                },
                onFailure = { error ->
                    Log.e(TAG, "Is recording check failed: ${error.message}")
                    Result.failure(error)
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Is recording exception: ${e.message}")
            Result.failure(e)
        }
    }
}