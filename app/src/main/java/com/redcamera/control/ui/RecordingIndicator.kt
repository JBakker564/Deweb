package com.redcamera.control.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import android.animation.ValueAnimator
import android.view.animation.LinearInterpolator
import com.redcamera.control.R

/**
 * Custom view that displays the recording status with an animated indicator
 */
class RecordingIndicator @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
    }

    private var isRecording = false
    private var animator: ValueAnimator? = null
    private var alpha = 255

    init {
        // Initialize with standby color
        paint.color = context.getColor(R.color.status_standby)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Draw the circle with current alpha
        paint.alpha = alpha
        val radius = (minOf(width, height) / 2).toFloat()
        canvas.drawCircle(width / 2f, height / 2f, radius, paint)
    }

    /**
     * Set the recording state and update the indicator
     */
    fun setRecording(recording: Boolean) {
        if (isRecording == recording) return
        
        isRecording = recording
        
        // Cancel any running animation
        animator?.cancel()
        
        if (isRecording) {
            // Set to recording color
            paint.color = context.getColor(R.color.status_recording)
            
            // Start blinking animation for recording state
            animator = ValueAnimator.ofInt(255, 100).apply {
                duration = 800
                repeatMode = ValueAnimator.REVERSE
                repeatCount = ValueAnimator.INFINITE
                interpolator = LinearInterpolator()
                addUpdateListener { animation ->
                    alpha = animation.animatedValue as Int
                    invalidate()
                }
                start()
            }
        } else {
            // Set to standby color and full opacity
            paint.color = context.getColor(R.color.status_standby)
            alpha = 255
            invalidate()
        }
    }

    /**
     * Set the connecting state (yellow indicator)
     */
    fun setConnecting() {
        // Cancel any running animation
        animator?.cancel()
        
        isRecording = false
        paint.color = context.getColor(R.color.status_connecting)
        alpha = 255
        invalidate()
    }

    /**
     * Set the error state (flashing red indicator)
     */
    fun setError() {
        // Cancel any running animation
        animator?.cancel()
        
        isRecording = false
        paint.color = context.getColor(R.color.status_error)
        
        // Start fast blinking animation for error state
        animator = ValueAnimator.ofInt(255, 0).apply {
            duration = 300
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener { animation ->
                alpha = animation.animatedValue as Int
                invalidate()
            }
            start()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}