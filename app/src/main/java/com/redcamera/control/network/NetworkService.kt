package com.redcamera.control.network

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Service that handles network communication with the RED camera
 */
class NetworkService {
    private val TAG = "NetworkService"
    
    private var socket: Socket? = null
    private var writer: PrintWriter? = null
    private var reader: BufferedReader? = null
    private val isConnected = AtomicBoolean(false)
    
    private var ipAddress: String = ""
    private var port: Int = 0
    
    /**
     * Connect to the camera
     */
    suspend fun connect(ip: String, port: Int): Boolean = withContext(Dispatchers.IO) {
        try {
            if (isConnected.get()) {
                disconnect()
            }
            
            this@NetworkService.ipAddress = ip
            this@NetworkService.port = port
            
            socket = Socket()
            socket?.connect(InetSocketAddress(ip, port), 5000) // 5 seconds timeout
            
            reader = BufferedReader(InputStreamReader(socket?.getInputStream()))
            writer = PrintWriter(socket?.getOutputStream(), true)
            
            isConnected.set(true)
            Log.d(TAG, "Connected to $ip:$port")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Connection error: ${e.message}")
            false
        }
    }
    
    /**
     * Disconnect from the camera
     */
    suspend fun disconnect(): Boolean = withContext(Dispatchers.IO) {
        try {
            writer?.close()
            reader?.close()
            socket?.close()
            
            writer = null
            reader = null
            socket = null
            
            isConnected.set(false)
            Log.d(TAG, "Disconnected")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Disconnect error: ${e.message}")
            false
        }
    }
    
    /**
     * Send a JSON-RPC command to the camera
     */
    suspend fun sendCommand(method: String, params: JSONObject? = null): Result<JSONObject> = withContext(Dispatchers.IO) {
        if (!isConnected.get()) {
            return@withContext Result.failure(Exception("Not connected"))
        }
        
        try {
            val requestId = System.currentTimeMillis().toString()
            val request = JSONObject().apply {
                put("jsonrpc", "2.0")
                put("method", method)
                if (params != null) {
                    put("params", params)
                }
                put("id", requestId)
            }
            
            Log.d(TAG, "Sending command: $request")
            writer?.println(request.toString())
            
            val response = reader?.readLine()
            if (response != null) {
                val jsonResponse = JSONObject(response)
                
                if (jsonResponse.has("error")) {
                    val error = jsonResponse.getJSONObject("error")
                    return@withContext Result.failure(Exception(
                        "Error ${error.optInt("code")}: ${error.optString("message")}"
                    ))
                }
                
                Log.d(TAG, "Received response: $jsonResponse")
                return@withContext Result.success(jsonResponse)
            } else {
                return@withContext Result.failure(Exception("Empty response"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Command error: ${e.message}")
            return@withContext Result.failure(e)
        }
    }
    
    /**
     * Check if the camera is currently connected
     */
    fun isConnected(): Boolean {
        return isConnected.get()
    }
    
    /**
     * Get the current connection information
     */
    fun getConnectionInfo(): Pair<String, Int> {
        return Pair(ipAddress, port)
    }
}