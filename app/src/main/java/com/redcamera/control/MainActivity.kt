package com.redcamera.control

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.HapticFeedbackConstants
import android.view.View
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.redcamera.control.camera.CameraCommands
import com.redcamera.control.databinding.ActivityMainBinding
import com.redcamera.control.network.NetworkService
import com.redcamera.control.utils.PreferenceManager
import kotlinx.coroutines.*

class MainActivity : AppCompatActivity() {
    private val TAG = "MainActivity"
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var preferences: PreferenceManager
    private val networkService = NetworkService()
    private lateinit var cameraCommands: CameraCommands
    
    private var isRecording = false
    private var statusCheckJob: Job? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        preferences = PreferenceManager(this)
        cameraCommands = CameraCommands(networkService)
        
        // Load saved settings
        loadSavedSettings()
        
        // Set up UI listeners
        setupListeners()
        
        // Update UI state
        updateUIState(false)
        
        Log.d(TAG, "MainActivity created")
    }
    
    private fun loadSavedSettings() {
        binding.ipAddressEditText.setText(preferences.getIpAddress())
        binding.portEditText.setText(preferences.getPort().toString())
        binding.isoEditText.setText(preferences.getIso().toString())
        binding.shutterAngleEditText.setText(preferences.getShutterAngle().toString())
    }
    
    private fun setupListeners() {
        // Connection buttons
        binding.connectButton.setOnClickListener {
            val ipAddress = binding.ipAddressEditText.text.toString()
            val portText = binding.portEditText.text.toString()
            
            if (ipAddress.isEmpty() || portText.isEmpty()) {
                showToast("Please enter IP address and port")
                return@setOnClickListener
            }
            
            val port = portText.toIntOrNull() ?: 8080
            
            connectToCamera(ipAddress, port)
        }
        
        binding.disconnectButton.setOnClickListener {
            disconnectFromCamera()
        }
        
        // Recording controls
        binding.startRecordingButton.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.HEAVY_CLICK)
            startRecording()
        }
        
        binding.stopRecordingButton.setOnClickListener {
            it.performHapticFeedback(HapticFeedbackConstants.HEAVY_CLICK)
            stopRecording()
        }
        
        // Camera settings
        binding.setIsoButton.setOnClickListener {
            val isoText = binding.isoEditText.text.toString()
            if (isoText.isEmpty()) {
                showToast("Please enter an ISO value")
                return@setOnClickListener
            }
            
            val iso = isoText.toIntOrNull()
            if (iso == null) {
                showToast("Invalid ISO value")
                return@setOnClickListener
            }
            
            setISO(iso)
        }
        
        binding.setShutterButton.setOnClickListener {
            val shutterText = binding.shutterAngleEditText.text.toString()
            if (shutterText.isEmpty()) {
                showToast("Please enter a shutter angle")
                return@setOnClickListener
            }
            
            val angle = shutterText.toDoubleOrNull()
            if (angle == null) {
                showToast("Invalid shutter angle")
                return@setOnClickListener
            }
            
            setShutterAngle(angle)
        }
    }
    
    private fun connectToCamera(ipAddress: String, port: Int) {
        binding.connectionStatusText.text = getString(R.string.connecting)
        binding.recordingIndicator.setConnecting()
        binding.statusMessageText.text = "Connecting to $ipAddress:$port..."
        
        // Save connection settings
        preferences.saveIpAddress(ipAddress)
        preferences.savePort(port)
        
        lifecycleScope.launch {
            val connected = networkService.connect(ipAddress, port)
            
            if (connected) {
                binding.connectionStatusText.text = getString(R.string.connected)
                binding.statusMessageText.text = "Connected to $ipAddress:$port"
                updateUIState(true)
                
                // Start regular status checks
                startStatusChecks()
            } else {
                binding.connectionStatusText.text = getString(R.string.connection_error)
                binding.recordingIndicator.setError()
                binding.statusMessageText.text = "Failed to connect to $ipAddress:$port"
                updateUIState(false)
            }
        }
    }
    
    private fun disconnectFromCamera() {
        // Stop status checks
        stopStatusChecks()
        
        lifecycleScope.launch {
            networkService.disconnect()
            binding.connectionStatusText.text = getString(R.string.disconnected)
            binding.statusMessageText.text = "Disconnected"
            updateUIState(false)
        }
    }
    
    private fun startRecording() {
        cameraCommands.startRecording { success, message ->
            binding.statusMessageText.text = message
            if (success) {
                isRecording = true
                updateRecordingUI(true)
            }
        }
    }
    
    private fun stopRecording() {
        cameraCommands.stopRecording { success, message ->
            binding.statusMessageText.text = message
            if (success) {
                isRecording = false
                updateRecordingUI(false)
            }
        }
    }
    
    private fun setISO(iso: Int) {
        cameraCommands.setISO(iso) { success, message ->
            binding.statusMessageText.text = message
            if (success) {
                // Save the ISO value
                preferences.saveIso(iso)
            }
        }
    }
    
    private fun setShutterAngle(angle: Double) {
        cameraCommands.setShutterAngle(angle) { success, message ->
            binding.statusMessageText.text = message
            if (success) {
                // Save the shutter angle
                preferences.saveShutterAngle(angle)
            }
        }
    }
    
    private fun startStatusChecks() {
        // Cancel existing job if running
        stopStatusChecks()
        
        // Create a new job that checks recording status every 3 seconds
        statusCheckJob = lifecycleScope.launch {
            while (isActive) {
                checkRecordingStatus()
                delay(3000) // 3 seconds
            }
        }
    }
    
    private fun stopStatusChecks() {
        statusCheckJob?.cancel()
        statusCheckJob = null
    }
    
    private suspend fun checkRecordingStatus() {
        val result = cameraCommands.isRecording()
        result.fold(
            onSuccess = { recording ->
                if (isRecording != recording) {
                    isRecording = recording
                    updateRecordingUI(recording)
                }
            },
            onFailure = {
                // Connection might be lost
                Log.e(TAG, "Failed to check recording status: ${it.message}")
                // If we keep failing, we might want to try reconnecting or notify the user
            }
        )
    }
    
    private fun updateRecordingUI(recording: Boolean) {
        runOnUiThread {
            isRecording = recording
            binding.recordingIndicator.setRecording(recording)
            
            val statusText = if (recording) {
                getString(R.string.recording_status, getString(R.string.recording))
            } else {
                getString(R.string.recording_status, getString(R.string.standby))
            }
            binding.recordingStatusLabel.text = statusText
            
            // Enable/disable appropriate recording buttons
            binding.startRecordingButton.isEnabled = !recording
            binding.stopRecordingButton.isEnabled = recording
        }
    }
    
    private fun updateUIState(connected: Boolean) {
        // Connection buttons
        binding.connectButton.isEnabled = !connected
        binding.disconnectButton.isEnabled = connected
        
        // Recording controls
        binding.startRecordingButton.isEnabled = connected && !isRecording
        binding.stopRecordingButton.isEnabled = connected && isRecording
        
        // Camera settings
        binding.setIsoButton.isEnabled = connected
        binding.setShutterButton.isEnabled = connected
        
        // Update recording indicator
        if (!connected) {
            isRecording = false
            binding.recordingIndicator.setRecording(false)
            binding.recordingStatusLabel.text = getString(R.string.recording_status, getString(R.string.standby))
        }
    }
    
    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Make sure to clean up and disconnect
        stopStatusChecks()
        lifecycleScope.launch {
            networkService.disconnect()
        }
        Log.d(TAG, "MainActivity destroyed")
    }
}