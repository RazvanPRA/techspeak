package com.techspeak.reminders

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

/** Stores the reminder and arms one alarm for its next occurrence (re-armed after each one). */
object ReminderScheduler {
  private const val PREFS = "techspeak.reminder"
  private const val KEY_ENABLED = "enabled"
  private const val KEY_HOUR = "hour"
  private const val KEY_MINUTE = "minute"
  private const val KEY_TITLE = "title"
  private const val KEY_BODY = "body"
  /** Inexact window: no SCHEDULE_EXACT_ALARM permission needed, still within a minute. */
  private const val WINDOW_MS = 60_000L

  data class Reminder(val hour: Int, val minute: Int, val title: String, val body: String)

  fun save(context: Context, reminder: Reminder) {
    prefs(context).edit()
      .putBoolean(KEY_ENABLED, true)
      .putInt(KEY_HOUR, reminder.hour)
      .putInt(KEY_MINUTE, reminder.minute)
      .putString(KEY_TITLE, reminder.title)
      .putString(KEY_BODY, reminder.body)
      .apply()
  }

  fun load(context: Context): Reminder? {
    val p = prefs(context)
    if (!p.getBoolean(KEY_ENABLED, false)) return null
    return Reminder(
      p.getInt(KEY_HOUR, 19),
      p.getInt(KEY_MINUTE, 0),
      p.getString(KEY_TITLE, "") ?: "",
      p.getString(KEY_BODY, "") ?: "",
    )
  }

  /** Arms the alarm for the next hour:minute that is still in the future. */
  fun armNext(context: Context, reminder: Reminder) {
    val next = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, reminder.hour)
      set(Calendar.MINUTE, reminder.minute)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
      if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
    }
    alarms(context).setWindow(AlarmManager.RTC_WAKEUP, next.timeInMillis, WINDOW_MS, pending(context))
  }

  fun cancel(context: Context) {
    prefs(context).edit().putBoolean(KEY_ENABLED, false).apply()
    alarms(context).cancel(pending(context))
  }

  private fun pending(context: Context): PendingIntent {
    val intent = Intent(context, ReminderReceiver::class.java).setAction(ReminderReceiver.ACTION_FIRE)
    return PendingIntent.getBroadcast(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun alarms(context: Context) = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
}
