package com.techspeak.reminders

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/** Shows the daily notification and re-arms tomorrow's alarm; re-arms it after a reboot too. */
class ReminderReceiver : BroadcastReceiver() {
  companion object {
    const val ACTION_FIRE = "com.techspeak.reminders.FIRE"
    private const val CHANNEL_ID = "daily-practice"
    private const val NOTIFICATION_ID = 1
  }

  override fun onReceive(context: Context, intent: Intent) {
    val reminder = ReminderScheduler.load(context) ?: return
    if (intent.action == ACTION_FIRE) show(context, reminder)
    ReminderScheduler.armNext(context, reminder)
  }

  private fun show(context: Context, reminder: ReminderScheduler.Reminder) {
    val manager = NotificationManagerCompat.from(context)
    if (!manager.areNotificationsEnabled()) return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel =
        NotificationChannel(CHANNEL_ID, "Daily practice", NotificationManager.IMPORTANCE_DEFAULT)
      context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val tap = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE)
    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_popup_reminder)
      .setContentTitle(reminder.title)
      .setContentText(reminder.body)
      .setContentIntent(tap)
      .setAutoCancel(true)
      .build()
    try {
      manager.notify(NOTIFICATION_ID, notification)
    } catch (_: SecurityException) {
      // POST_NOTIFICATIONS was revoked: nothing to show.
    }
  }
}
