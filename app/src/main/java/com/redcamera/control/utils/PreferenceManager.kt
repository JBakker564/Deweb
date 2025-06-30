package com.redcamera.control.utils

import android.content.Context
import android.content.SharedPreferences

/**
 * Helper class to manage user preferences
 */
class PreferenceManager(context: Context) {
    private val PREFS_NAME = "RedCameraControlPrefs"
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    companion object {
        const val KEY_IP_ADDRESS = "ip_address"
        const val KEY_PORT = "port"
        const val KEY_ISO = "iso"
        const val KEY_SHUTTER_ANGLE = "shutter_angle"
    }
    
    /**
     * Save camera IP address
     */
    fun saveIpAddress(ipAddress: String) {
        prefs.edit().putString(KEY_IP_ADDRESS, ipAddress).apply()
    }
    
    /**
     * Get saved camera IP address
     */
    fun getIpAddress(): String {
        return prefs.getString(KEY_IP_ADDRESS, "192.168.1.1") ?: "192.168.1.1"
    }
    
    /**
     * Save camera port
     */
    fun savePort(port: Int) {
        prefs.edit().putInt(KEY_PORT, port).apply()
    }
    
    /**
     * Get saved camera port
     */
    fun getPort(): Int {
        return prefs.getInt(KEY_PORT, 8080)
    }
    
    /**
     * Save last ISO value
     */
    fun saveIso(iso: Int) {
        prefs.edit().putInt(KEY_ISO, iso).apply()
    }
    
    /**
     * Get saved ISO value
     */
    fun getIso(): Int {
        return prefs.getInt(KEY_ISO, 800)
    }
    
    /**
     * Save last shutter angle value
     */
    fun saveShutterAngle(angle: Double) {
        prefs.edit().putFloat(KEY_SHUTTER_ANGLE, angle.toFloat()).apply()
    }
    
    /**
     * Get saved shutter angle value
     */
    fun getShutterAngle(): Double {
        return prefs.getFloat(KEY_SHUTTER_ANGLE, 180.0f).toDouble()
    }
}